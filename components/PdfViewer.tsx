"use client";

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { pdfjs } from "react-pdf";
import { Rnd } from 'react-rnd';
import JSZip from 'jszip';
import { FontsArray } from "../constants/availableFonts";
import { Participant } from "../constants/customTypes";
import { rgbToHex, hexToRgb } from '@/lib/actions';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

type Props = {
    pdfFile: File | undefined,
    pdfFileUrl: string | undefined,
    pdfFileBytes: ArrayBuffer | undefined,
    participantList: Participant[]
}

const PdfViewer = ({ pdfFile, pdfFileUrl, pdfFileBytes, participantList }: Props) => {

    const imgRef = useRef<HTMLImageElement>(null);
    // const [locationX, setLocationX] = useState<number>(0);
    const [locationY, setLocationY] = useState<number>(0);
    const [fontSize, setFontSize] = useState<number>(24);
    const [fontColor, setFontColor] = useState<{ r: number, g: number, b: number}>({ r: 0, g: 0, b: 0});
    const [selectedFont, setSelectedFont] = useState<string>(FontsArray[6]);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [imageOrientation, setImageOrientation] = useState<string>("");
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [previewImageUrl, setPreviewImageUrl] = useState<string>("");

    useEffect(() => {
        convertPdfToImage(pdfFileUrl as string, "original");
    }, [pdfFileUrl]);

    useEffect(() => {
        if (imgRef.current) {
            // Get image dimensions after it has loaded
            const handleImageLoad = () => {
                setImageDimensions({
                    width: imgRef.current?.width as number,
                    height: imgRef.current?.height as number,
                });
            };
    
            // Attach the event listener
            imgRef.current.addEventListener("load", handleImageLoad);
    
            // Remove the event listener when the component unmounts
            return () => {
                imgRef.current?.removeEventListener("load", handleImageLoad);
            };
        }
    }, [imageUrl]); // Trigger effect when imageUrl changes
    
    useEffect(() => {
        // Update image dimensions when the window is resized
        const handleResize = () => {
            setImageDimensions({
                width: imgRef.current?.width || 0,
                height: imgRef.current?.height || 0,
            });
        };
    
        // Attach the event listener
        window.addEventListener("resize", handleResize);
    
        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []); // Trigger effect only once when the component mounts

    const setImage = (url: string, orientation: string) => {
        setImageUrl(url);
        setImageOrientation(orientation);
    };

    // credit to: https://medium.com/@charanvinaynarni/pdf-to-image-conversion-using-reactjs-fd250a25bf05
    // Convert pdf blob to image blob
    const convertPdfToImage = (url: string, fileStatus: string) => {
        // Because the url may be undefined
        if (url) {
            fetch(url).then((response) => {
                response.blob().then((blob) => {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        const data = ((e.target?.result as string).replace(/.*base64,/, ""));
                        const decodedData = atob(data);
                        renderPageAsImage(decodedData, fileStatus);
                    };
                    reader.readAsDataURL(blob);
                });
            });
        }
        else {
            return;
        }
    };

    // credit to: https://medium.com/@charanvinaynarni/pdf-to-image-conversion-using-reactjs-fd250a25bf05
    // Render the image blob data
    const renderPageAsImage = async (data: string, fileStatus: string) => {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("className", "canv");
        const pdf = await pdfjs.getDocument({ data }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var viewport = page.getViewport({ scale: 1.5 });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var render_context = {
                canvasContext: canvas.getContext("2d") || null,
                viewport: viewport,
            };
            await page.render(render_context as any).promise;
            let pdfImage = canvas.toDataURL("image/png");
            if (fileStatus === "original") {
                // Determine whether the PDF is horizontal or vertical
                if (viewport.width > viewport.height) {
                    setImage(pdfImage, "landscape");
                } 
                else {
                    setImage(pdfImage, "potrait");
                }
            }
            if (fileStatus === "edited") {
                setPreviewImageUrl(pdfImage)
            }
        }
    };

    // To measure text input and divide it necessarily
    const breakTextIntoLines = (text: string, font: any, size: number, maxWidth: number) => {
        // Splits the input text into an array of words
        const words = text.split(" ");
        let lines: string[] = [];
        let currentLine = words[0];
    
        // Loop through each word in the array
        for (let i = 1; i < words.length; i++) {
            // Concatenate the current line with the next word to form a line that is to be measured
            const measuredLine = currentLine + " " + words[i];
            // Calculate the width of the measured line using the provided font and font size
            let width;
            try {
                width = font.widthOfTextAtSize(measuredLine, size);
            }
            catch (error) {
                alert("Unreadable character detected in name list.");
                return;
            }
            // Check if the width of the measured line is within the specified maximum width
            if (width < maxWidth) {
                // If the measured line fits within the maximum width, update the current line
                currentLine = measuredLine;
            }
            else {
                // If the measured line exceeds the maximum width, push the current line to the lines array 
                lines.push(currentLine);
                // Reset the current line to the current word, starting a new line
                currentLine = words[i];
            }
        }
        // Push the last remaining line (or the only line if there's only one word) to the lines array
        lines.push(currentLine);
        return lines;
    };

    // To count the y offset for each specified dimensions
    const getYOffset = () => {
        let yValue;
        if (imageOrientation === "landscape" && imageDimensions.height >= 595) {
            yValue = imageDimensions.height - locationY - 4;
        }
        else if (imageOrientation === "potrait" && imageDimensions.height >= 842) {
            yValue = imageDimensions.height - locationY;
        }
        else if (imageOrientation === "landscape" && imageDimensions.height >= 417) {
            yValue = ((imageDimensions.height - locationY) / 0.7);
        }
        else if (imageOrientation === "potrait" && imageDimensions.height >= 589) {
            yValue = ((imageDimensions.height - locationY) / 0.7) + 5;
        }
        else if (imageOrientation === "landscape" && imageDimensions.height >= 298)  {
            yValue = ((imageDimensions.height - locationY) / 0.5) - 5;
        }
        else if (imageOrientation === "potrait" && imageDimensions.height >= 421)  {
            yValue = ((imageDimensions.height - locationY) / 0.5) + 5;
        }
        else if (imageOrientation === "landscape" && imageDimensions.height >= 238) {
            yValue = ((imageDimensions.height - locationY) / 0.4) - 15;
        }
        else {
            yValue = ((imageDimensions.height - locationY) / 0.4) - 5;
        }

        return yValue;
    };

    const getPdfMaxWidth = (firstPage: PDFPage) => {
        let maxWidth;
        if (imageOrientation === "landscape") {
            maxWidth = firstPage.getWidth() * 0.7;
        }
        else {
            maxWidth = firstPage.getWidth() * 0.8;
        }
        return maxWidth;
    };
    
    const updatePdf = async (participantName: string | undefined) => {
        const pdfDoc = await PDFDocument.load(pdfFileBytes as ArrayBuffer);
        const fontType = await pdfDoc.embedFont(selectedFont);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        alert(firstPage.getHeight())
        const text = participantName as string;
        const textSize = fontSize;
        const maxWidth = getPdfMaxWidth(firstPage);
        const lines = breakTextIntoLines(text, fontType, textSize, maxWidth);
        let yOffset = getYOffset();
        if (lines) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const textWidth = fontType.widthOfTextAtSize(line, textSize);
                const textHeight = fontType.heightAtSize(textSize);
                const isMultipleLines = lines.length > 1;
            
                const yAdjustment = isMultipleLines ? textHeight / 2 : 0;
                firstPage.drawText(line, {
                    x: firstPage.getWidth() / 2 - textWidth / 2,
                    y: yOffset - textHeight + yAdjustment,
                    size: textSize,
                    font: fontType,
                    color: rgb(fontColor.r / 255, fontColor.g / 255, fontColor.b / 255), // divide by 255 because of the library input limit number to 1
                });
            
                yOffset -= textHeight; // Adjust for the next line
            }
        }
    
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    };

    const renderPreviewEditedPdf = async () => {
        const pdfBytes = await updatePdf("Participant's Name");
        // Convert PDF bytes to a Blob
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        // Convert Blob to a data URL
        const editedPdfDataUrl = URL.createObjectURL(blob);
        // Conver to pdf
        convertPdfToImage(editedPdfDataUrl, "edited");
    };

    const generateCertificatePreview = async () => {
        const previewNames: string[] = ["Participant's Name", "Participant's Name That Is Long Should Be Printed In This Format And Outline"];
        const pdfPreviewFile: Uint8Array[] = [];
        for ( let i = 0; i < previewNames.length; i++) {
            const pdfBytes = await updatePdf(previewNames[i]);
            pdfPreviewFile.push(pdfBytes);
        }
        const mergedPdf = await PDFDocument.create();
        for ( let i = 0; i < pdfPreviewFile.length; i++) {
            const pdfToBeCopied = await PDFDocument.load(pdfPreviewFile[i]);
            const copiedPages = await mergedPdf.copyPages(pdfToBeCopied, pdfToBeCopied.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page)
            });
        }
        const mergedPdfFileBytes = await mergedPdf.save();
        var blob = new Blob([mergedPdfFileBytes], { type: "application/pdf" });
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `name2ecert-preview.pdf`;
        link.click();
    };

    const generateCertificatesInZip = async () => {
        if (participantList.length <= 0) {
            alert("Please upload a CSV file.")
            return;
        };
        const zip = new JSZip();
        await Promise.all(
            participantList.map(async (participant) => {
                const pdfBytes = await updatePdf(participant.name);
                const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    
                // Add the PDF file to the zip with a specific name
                zip.file(`${participant.name}-certificate.pdf`, pdfBlob);
            })
        );
    
        // Generate the zip file
        zip.generateAsync({ type: "blob" }).then((content) => {
            // Create a download link for the zip file
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(content);
            link.download = "certificates.zip";
    
            // Append the link to the document and trigger a click to start the download
            document.body.appendChild(link);
            link.click();
    
            // Remove the link from the document
            document.body.removeChild(link);
        });
    };

    const handleSetFontSize = (e: ChangeEvent<HTMLInputElement>) => {
        const fontSizeValue = parseInt(e.target.value, 10);
        setFontSize(fontSizeValue);
    };

    const handleFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedFont(e.target.value);
    };

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Assuming the input is in the format #RRGGBB
        const hexColor = e.target.value;
        const rgbColor = hexToRgb(hexColor);
        setFontColor(rgbColor);
    };

    return (
        <div className="w-full flex flex-col justify-center items-center gap-5 mb-5">
            {
                imageUrl ? (
                    <div className="w-fit h-fit flex justify-center relative">
                        {
                            <img
                                ref={imgRef}
                                src={imageUrl} 
                                alt="pdf-image" 
                                className={`${imageOrientation === "landscape" ? "pdf-image-horizontal" : "pdf-image-vertical"} flex justify-center`}
                            />
                        }
                        <Rnd
                            default={{ x: 0, y: 0, width: "22%", height: "10%" }}
                            disableDragging={false} // Set to true if you want to disable dragging
                            bounds="parent"
                            enableResizing={false} // Set to true if you want to enable resizing
                            dragHandleClassName="drag-handle"
                            onDragStop={(e, d) => {
                                // 'd' contains the new position (x, y) after dragging stops
                                //setLocationX(d.x); 
                                setLocationY(d.y);
                            }}
                        >
                            <textarea
                                className="w-full text-center resize-none overflow-hidden text-white bg-slate-700 border-2 border-black rounded-sm"
                                value="Name here"
                                rows={1}
                                readOnly
                                style={{ fontSize: "1.4vw" }}
                            />
                            <div className="drag-handle" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "move" }} />
                        </Rnd>
                    </div>
                ) : (
                    <div className="w-full sm:w-1/2 py-10 flex justify-center border border-dashed ">
                        No pdf file uploaded.
                    </div>
                )
            }
            {
                imageUrl && (
                    <>
                        <div className="flex justify-center flex-col sm:flex-row gap-5">
                            <div className="flex w-full justify-center gap-5">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="float-left py-1 pr-2">Font size:</td>
                                            <td >
                                                <div>
                                                    <input
                                                        className="text-black p-1 h-5 outline-none rounded-md w-full"
                                                        type="number"
                                                        id="numeric-input"
                                                        name="numeric-input"
                                                        min="0"   
                                                        max="99" 
                                                        step="1"
                                                        value={fontSize}
                                                        onChange={handleSetFontSize}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="float-left py-1 pr-2">Font type:</td>
                                            <td>
                                                <div>
                                                    <select
                                                        id="font-input"
                                                        value={selectedFont}
                                                        onChange={handleFontChange}
                                                        className="text-black rounded-md w-full"
                                                    >
                                                        {FontsArray.map((font) => (
                                                            <option key={font} value={font}>
                                                                {font}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="float-left py-1 pr-2">Font color:</td>
                                            <td>
                                                <div>
                                                    <input 
                                                        type="color" 
                                                        id="font-color-input" 
                                                        name="font-color-input" 
                                                        className="text-black rounded-md w-full h-5"
                                                        value={`#${rgbToHex(fontColor.r)}${rgbToHex(fontColor.g)}${rgbToHex(fontColor.b)}`}
                                                        onChange={handleColorChange}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={renderPreviewEditedPdf}
                                    className="rounded-full border border-white bg-zinc-900 py-1.5 px-5 text-white transition-all hover:bg-white hover:text-black hover:border-black text-center text-sm flex items-center justify-center"
                                >
                                    Preview
                                </button>
                            </div>
                        </div>
                    </>
                    
                )
            }
            {
                previewImageUrl && (
                    <>
                        <div className="w-full flex justify-center">
                            <img 
                                src={previewImageUrl} 
                                alt="pdf-image" 
                                className={`${imageOrientation === "landscape" ? "pdf-image-horizontal" : "pdf-image-vertical"} flex justify-center`}
                            />
                        </div>
                        <div className="flex justify-center sm:flex-row flex-col gap-5">
                            <button onClick={() => {generateCertificatePreview()}} className="rounded-full border border-white bg-zinc-900 py-1.5 px-5 text-white transition-all hover:bg-white hover:text-black hover:border-black text-center text-sm flex items-center justify-center">
                                Download Preview
                            </button>
                            <button onClick={() => {generateCertificatesInZip()}} className="rounded-full border border-white bg-zinc-900 py-1.5 px-5 text-white transition-all hover:bg-white hover:text-black hover:border-black text-center text-sm flex items-center justify-center">
                                Download All in ZIP
                            </button>
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default PdfViewer;