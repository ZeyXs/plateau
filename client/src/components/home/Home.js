import { useState } from "react";
import Hero from "./Hero";
import Navbar from "./Navbar";
import useAuth from "../../hooks/useAuth";

const Home = () => {
    return (
        <div>
            <Navbar />
            <Hero />
        </div>
    );
};

export default Home;
