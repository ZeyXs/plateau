import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import Hero from "./Hero";
import Navbar from "./Navbar";

const Home = () => {

    const { auth } = useAuth();

    console.log(`[Home.js] ${auth?.user}`);

    return (
        <div>
            <Navbar />
            <Hero />
        </div>
    );
};

export default Home;
