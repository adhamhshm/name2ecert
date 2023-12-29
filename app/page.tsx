import FileUpload from "../components/FileUpload";
import Nav from "../components/Nav";

const Home = () => {
    return (
        <div>
            <Nav />
            <div className="flex justify-center text-5xl font-satoshi font-bold p-10">
                <h1>name2ecert</h1>
            </div>
            <article className="w-full flex justify-center font-inter flex-col gap-5 text-center px-10">
                <h3 className="text-xl">
                    Introducing a web platform designed to streamline participants' e-certificate process for event organizers!
                </h3>
                {/* <p className="text-sm">
                   Our innovative solution takes the hassle out of managing participant certificates by providing a
                   seamless and efficient way to create e-certificates for all event attendees.
                </p> */}
            </article>
            <FileUpload />
        </div> 
    )
}

export default Home;