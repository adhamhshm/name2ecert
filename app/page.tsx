import FileUpload from "../components/FileUpload";

const Home = () => {
    return (
        <div>
            <div className="hidden sm:flex justify-center text-5xl font-satoshi font-bold px-10 pt-10">
                <h1>name2ecert</h1>
            </div>
            <article className="w-full flex justify-center font-inter flex-col text-center p-10">
                <h3 className="text-xl">
                    A Web Platform to Streamline Name Generation on Digital Certificate
                </h3>
            </article>
            <FileUpload />
        </div> 
    )
}

export default Home;