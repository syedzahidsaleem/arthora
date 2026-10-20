import React from "react";
import { FluidParticlesBackground } from "@/components/ui/fluid-particles-background"; 

const DemoFluidParticlesBackground = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-black">
      <FluidParticlesBackground>
        <div className="text-center space-y-4 lg:space-y-6 z-10">
          <h1 className="text-4xl lg:text-6xl text-white font-bold">
            Arthora
          </h1>
        </div>
      </FluidParticlesBackground>
    </div>
  );
};

export { DemoFluidParticlesBackground };
