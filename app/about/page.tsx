import Image from "next/image";

const About = () => {
    return (
        <div className="flex justify-center items-center flex-col gap-5 pb-5">
            <div className="flex justify-center font-inter flex-col text-center p-10 pb-0 gap-5">
                <h3 className="text-xl">
                    Generate Name On Certificate Made Easy
                </h3>
                <h3 className="text-xl">
                    Save your time to generate multiple digital certificates with different names!
                </h3>
            </div>
            <div className="w-full flex justify-center sm:mt-5">
                <div className="w-full grid grid-rows-1 sm:grid-cols-4 gap-1">
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/upload.svg" alt="upload" width={200} height={200} className="w-1/5" />
                        <p className="text-md text-center">
                            Upload the name list and the e-certificate you had created.
                            Get the <a href="/template/namelist-template.csv" download className="underline underline-offset-4">CSV Template here</a>.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/move.svg" alt="move" width={200} height={200} className="w-1/5" />
                        <p className="text-md text-center">
                            Move the name anchor to your preferred position. The printed text will 
                            always always be centered horizontally.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/custom.svg" alt="custom" width={200} height={200} className="w-1/5" />
                        <p className="text-md text-center">
                            Customize the font size, font type, and font color according to your preferences.
                        </p>
                    </div>
                    <div className="flex justify-center items-center flex-col gap-5 pb-5 px-2 lg:px-10">
                        <Image src="/assets/download.svg" alt="download" width={200} height={200} className="w-1/5" />
                        <p className="text-md text-center">
                            Click preview to update any changes and download the files as ZIP. Unzip it to view all certificates. 
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center flex-col gap-1 py-4 px-10 bg-zinc-900 w-4/5 sm:w-1/2 rounded-xl border">
                <span className="font-bold">Important Notes:</span>
                <div>
                <ul className="list-disc">
                    <li>Names must be formatted in one column using the CSV file format.</li>
                    <li>Header labeled "name" should be spelled in lowercase.</li>
                    <li>PDF document must be A4 size (210 x 297 mm) for better accuracy (the name anchor may not reflect the exact expected location).</li>
                    <li>Recommend a 16:9 screen for optimal view and usage.</li>
                    <li>Some characters like a letter with stroke may not be read, leaving an empty space.</li>
                    <li>This app is suitable if only the name is to be positioned center.</li>
                </ul>
                </div>
            </div>
        </div>
    )
};

export default About;