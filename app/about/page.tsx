import Image from "next/image";

const About = () => {
    return (
        <div className="flex justify-center items-center flex-col gap-5 pb-5">
            <div className="flex justify-center font-inter flex-col text-center p-10 pb-0 gap-5">
                <h3 className="text-xl">
                    Generate Name On Certificate Made Easy
                </h3>
                <p className="text-md">
                    Save your time in generating multiple digital certificates with different names!
                </p>
            </div>
            <div className="w-full flex justify-center">
                <div className="w-full grid grid-rows-1 sm:grid-cols-4 gap-1">
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/upload.svg" alt="upload" width={200} height={200} className="w-2/5" />
                        <p className="text-md text-center">
                            Upload the name list with a header labeled "name".
                            Get the <a href="/template/namelist-template.csv" download className="underline underline-offset-4">CSV Template here</a>.
                            Upload the the e-certificate you have created.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/move.svg" alt="move" width={200} height={200} className="w-2/5" />
                        <p className="text-md text-center">
                            Move and place the name anchor to your preferred location on the certificate.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/custom.svg" alt="custom" width={200} height={200} className="w-2/5" />
                        <p className="text-md text-center">
                            Customize the font size, font type, and font color according to your preferences.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/download.svg" alt="download" width={200} height={200} className="w-2/5" />
                        <p className="text-md text-center">
                        Preview the changes and download the files as ZIP. Unzip the file to view all generated certificates. 
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center flex-col gap-1 py-4 px-10 bg-zinc-900 w-4/5 sm:w-1/2 rounded-xl border">
                <span className="font-bold">Important Notes:</span>
                <div>
                <ul className="list-disc">
                    <li>Name list must be in CSV file format.</li>
                    <li>Header labeled "name" should be spelled in lowercase.</li>
                    <li>E-certificate must be in PDF file format.</li>
                    <li>For optimal usage, recommend a 16:9 screen and format the PDF document to A4 size, whether in landscape or portrait orientation.</li>
                    <li>Some characters like a letter with stroke may not be read, leaving an empty space.</li>
                </ul>
                </div>
            </div>
        </div>
    )
};

export default About;