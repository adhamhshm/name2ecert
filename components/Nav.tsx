import Link from "next/link";
import Image from "next/image";

const Nav = () => {
    return (
        <nav className="w-full flex justify-between bg-black py-4 px-5 md:px-32 font-inter text-xl shadow-zinc-500 shadow-sm">
            <Link href="/">
                <p className="font-satoshi font-bold">
                    name2ecert
                </p>
            </Link>
            <div className="flex flex-row gap-20">
                <Link href="/about" className="flex justify-center items-center gap-2">
                    <Image 
                        src="/assets/about.svg" 
                        alt="about" 
                        width={25} 
                        height={25} 
                        className="object-contain" 
                    />
                    <p className="hidden sm:flex">
                        About
                    </p>
                </Link>
            </div>
        </nav>
    )
}

export default Nav;