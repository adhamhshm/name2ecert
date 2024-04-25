"use client";

import { ChangeEvent, useState } from "react";
import csv from "csv-parser";
import PdfViewer from "./PdfViewer";
import { Participant } from "../constants/customTypes";
import { PDFDocument } from "pdf-lib";

const FileUpload = () => {

    const [participantList, setParticipantList] = useState<Participant[]>([]);
    const [pdfFile, setPdfFile] = useState<File>();
    const [pdfFileUrl, setPdfFileUrl] = useState<string>();
    const [pdfFileBytes, setPdfFileBytes] = useState<ArrayBuffer>();

    // Read the csv or pdf file content for text and array buffer respectively
    const getFileContent = async (file : File) => {
        // Built-in JavaScript API for reading files asynchronously
        return new Promise((resolve, reject) => {
            // Create a new FileReader instance
            const reader = new FileReader();
            // Event handler for when the file reading operation is successful
            // Resolve the promise with the result of the file reading operation
            reader.onload = (e) => resolve(e.target?.result as string);
            // Event handler for when an error occurs during the file reading operation
            // Reject the promise with an error indicating a failure in reading the file
            reader.onerror = (e) => reject(new Error("Error reading file."));
            // Start reading the contents of the file as text
            if (file.name.endsWith(".csv")) {
                reader.readAsText(file, "UTF-8");
            }

            if (file.name.endsWith(".pdf")) {
                reader.readAsArrayBuffer(file);
            }
        });
    };

    // To parse the csv data from the csv file content
    const parseCsvData = (content: string) => {
        const results: Participant[] = [];
        let checkHeader = true;
        csv({})
            .on("headers", (headers) => {
                // Check if the header spelled correctly
                if (headers[0] !== "name") {
                    alert("The header in the CSV file data might have been spelled wrong.");
                    checkHeader = false;
                }
            })
            .write(content);
        // Use "skiplines", assuming the CSV has a header row
        // The .on("data", ...) is like an event listener to the "data" event. When the parser processes a row of data, this event 
        // is emitted, and the provided callback is executed, pushing the data (a row from the CSV file) into the "results" array.
        // write() will send the raw "content" of the file (e.target?.result) to the parser. This triggers the parsing process, and 
        // as each row of data is parsed, the "data" event is emitted, and the provided callback is executed.
        if (checkHeader === true) {
            csv({ skipLines: 0 })
                .on("data", (data) => {
                    results.push(data)
                })
                .write(content);
        }
    
        return results;
    };

    // Handle the uploaded csv file
    const handleCsvFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];

        try {
            // Check if the file has a CSV file extension
            if (file && file.name.endsWith(".csv")) {
                const content = await getFileContent(file);
                const parsedResults = parseCsvData(content as string);
                // If the parsedResults data is undefined, dont save the file
                if (parsedResults.length < 1) {
                    e.target.value = "";
                    return;
                }
                setParticipantList(parsedResults);
            }
            else {
                alert("Selected file is not a CSV file.");
                e.target.value = "";
                return;
            }
        }
        catch (error) {
            alert("Error reading CSV file.");
        }
    };

    // Read the pdf file content for its url
    const getPdfFileDataUrl = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(new Error("Error reading file."));
            reader.readAsDataURL(file);
        });
    };

    const readPdfFile = async (file : File) => {
        const existingPdfBytes = await getFileContent(file);
        const pdfValidityStatus = await validatePdfFile(existingPdfBytes as ArrayBuffer);
        if (pdfValidityStatus === false) {
            return "Read file failed.";
        }
        setPdfFileBytes(existingPdfBytes as ArrayBuffer);
        const existingPdfDataUrl = await getPdfFileDataUrl(file) as string;
        setPdfFileUrl(existingPdfDataUrl as string);
        return "Read file successful.";
    };

    // Validate pdf file pages, width and height
    const validatePdfFile = async (pdfFileBytes: ArrayBuffer) => {
        const pdfDoc = await PDFDocument.load(pdfFileBytes as ArrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        if (totalPages > 1) {
            alert("Please upload a single page PDF file.");
            return false;
        }
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        // Small A4 width range to avoid too big or too small document dimensions
        if (!((firstPage.getWidth() >= 841 && firstPage.getWidth() <= 843) || (firstPage.getWidth() >= 595 && firstPage.getWidth() <= 596))) {
            alert("PDF width does not match A4 format.");
            return false;
        }
        // Small A4 height range to avoid too big or too small document dimensions
        if (!((firstPage.getHeight() >= 595 && firstPage.getHeight() <= 596) || (firstPage.getHeight() >= 841 && firstPage.getHeight() <= 843))) {
            alert("PDF height does not match A4 format.");
            return false;
        }
        return true;
    };

    // Handle the uploaded pdf file
    // Somehow would love to review this later
    const handlePdfFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];

        try {
            // Check if the file has a CSV file extension
            if (file && file.name.endsWith(".pdf")) {
                if (await readPdfFile(file) === "Read file failed.") {
                    e.target.value = "";
                    return;
                };
                setPdfFile(file);
                
            } 
            else {
                alert("Selected file is not a PDF file.");
                e.target.value = "";
                return;
            }
        } 
        catch (error) {
            alert("Error reading PDF file.");
        }
    };

    return (
        <div className="w-full flex justify-center flex-col items-center gap-10 px-5">
            <div className="w-full sm:w-1/2 flex justify-center flex-col lg:flex-row gap-10">
                <div className="w-full bg-zinc-900 border border-white rounded-xl dark:border-white">
                    <form className="flex flex-col gap-4 p-5">
                        <label htmlFor="excel-file" id="label-excel-file">
                            CSV file with list name:
                        </label>
                        <input type="file" id="excel-file" name="excel-file" onChange={handleCsvFileChange}/>
                    </form>
                </div>
                <div className="w-full bg-zinc-900 border border-black rounded-xl dark:border-white">
                    <form className="flex flex-col gap-4 p-5">
                        <label htmlFor="pdf-file" id="label-pdf-file">
                            PDF file with e-certificate:
                        </label>
                        <input type="file" id="pdf-file" name="pdf-file" onChange={handlePdfFileChange}/>
                    </form>
                </div>
            </div>
            <PdfViewer 
                pdfFile={pdfFile}
                pdfFileUrl={pdfFileUrl}
                pdfFileBytes={pdfFileBytes}
                participantList={participantList}
            />
        </div>
    )
}

export default FileUpload;