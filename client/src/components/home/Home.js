import { useState } from "react";
import Hero from "./Hero";
import Navbar from "./Navbar";
import useAuth from "../../hooks/useAuth";

const Home = () => {

    const { auth } = useAuth();
    console.log(`[Home.js] ${auth.accessToken}`);
    console.log(`[Home.js] ${auth.roles}`);

    return (
        <div>
            <Navbar />
            <Hero />
        </div>
    );
};

export default Home;
