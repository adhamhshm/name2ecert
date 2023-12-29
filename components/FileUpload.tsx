"use client";

import { ChangeEvent, use, useState } from "react";
import csv from "csv-parser";
import PdfViewer from "./PdfViewer";
import { Participant } from "../constants/customTypes";

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
                reader.readAsText(file);
            }

            if (file.name.endsWith(".pdf")) {
                reader.readAsArrayBuffer(file);
            }
        });
    };

    // To parse the csv data from the csv file content
    const parseCsvData = (content: string) => {
        const results: Participant[] = [];
        // Use "skiplines", assuming the CSV has a header row
        // The .on("data", ...) is like an event listener to the "data" event. When the parser processes a row of data, this event 
        // is emitted, and the provided callback is executed, pushing the data (a row from the CSV file) into the "results" array.
        // write() will send the raw "content" of the file (e.target?.result) to the parser. This triggers the parsing process, and 
        // as each row of data is parsed, the "data" event is emitted, and the provided callback is executed.
        csv({ skipLines: 0 })
            .on("data", (data) => results.push(data))
            .write(content);
        return results;
    };

    // To get the participant list from the csv file
    const getParticipantCsvFile = async (file : File) => {
        try {
            const content = await getFileContent(file);
            const parsedResults = parseCsvData(content as string);
            setParticipantList(parsedResults);
        }
        catch {
            alert("Error reading or parsing the CSV file.");
        }
    };

    // Handle the uploaded csv file
    const handleCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];

        try {
            // Check if the file has a CSV file extension
            if (file && file.name.endsWith(".csv")) {
                getParticipantCsvFile(file);
            }
            else {
                alert("Selected file is not a CSV file.");
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
        const existingPdfDataUrl = await getPdfFileDataUrl(file) as string;
        setPdfFileUrl(existingPdfDataUrl as string);
        const existingPdfBytes = await getFileContent(file);
        setPdfFileBytes(existingPdfBytes as ArrayBuffer);
    };

    // Handle the uploaded pdf file
    const handlePdfFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];

        try {
            // Check if the file has a CSV file extension
            if (file && file.name.endsWith(".pdf")) {
                readPdfFile(file)
                setPdfFile(file);
                
            } 
            else {
                alert("Selected file is not a PDF file.");
            }
        } 
        catch (error) {
            alert("Error reading PDF file.");
        }
    };

    return (
        <div className="w-full flex justify-center flex-col items-center gap-10 p-10 px-5">
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