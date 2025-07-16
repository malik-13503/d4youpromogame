import { useQuery } from "@tanstack/react-query";
import gameCardImage from "../../../attached_assets/Home-page-D4U-Pros-Scratch-&-Win-Game-Card-EMPTY_1751279689511.png";

export default function GamePreview() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <section className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            $5 MILLION INSTANT PRIZES
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
            IT'S TIME TO PLAY OUR SCRATCH & WIN GAME
          </h3>
          <p className="text-xl font-bold text-white">
            2 CHANCES TO WIN AMAZING PRIZES!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Game Card Preview */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 transform hover:scale-105 transition-all duration-300 max-w-4xl w-full">
              <img
                src={gameCardImage}
                alt="Scratch & Win Game Card"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Trust Indicator */}
          <div className="text-center bg-white bg-opacity-90 rounded-xl p-6 max-w-4xl mx-auto">
            <p className="text-[hsl(225,47%,32%)] font-bold text-lg mb-2">
              Our 20 Connection New Parts Installations Program
            </p>
            <p className="text-[hsl(225,47%,32%)] font-semibold text-xl">
              is already Protecting{" "}
              <span className="text-[hsl(16,100%,64%)]">
                {stats?.registrationCount
                  ? `${Math.max(300000, stats.registrationCount).toLocaleString()}+`
                  : "300,000+"}
              </span>{" "}
              Home Owners nationwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
