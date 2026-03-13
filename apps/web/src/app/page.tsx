import { LandingHeader } from "@/components/landing/landing-header";
import { ProtocolRail } from "@/components/landing/protocol-rail";
import { DashboardReveal } from "@/components/landing/dashboard-reveal";
import { MetricsMosaic } from "@/components/landing/metrics-mosaic";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AgentsGrid } from "@/components/landing/agents-grid";
import { PrivacySplitView } from "@/components/landing/privacy-split-view";
import { ArchitectureOverview } from "@/components/landing/architecture-overview";
import { ComparisonCards } from "@/components/landing/comparison-cards";
import { Footer } from "@/components/landing/footer";

function FeatureCard({
  number,
  text1,
  text2,
  glowPosition,
  rotate = "none",
}: {
  number: string;
  text1: string;
  text2: string;
  glowPosition: string;
  rotate?: "left" | "right" | "none";
}) {
  let gradientClass = "bg-gradient-to-br from-[#ff0033]/10 to-transparent";
  let blurClass =
    "absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff0033] rounded-full blur-[60px] opacity-20";

  if (glowPosition === "bottom") {
    gradientClass = "bg-gradient-to-t from-[#ff0033]/20 to-transparent";
    blurClass =
      "absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#ff0033] rounded-full blur-[60px] opacity-30";
  } else if (glowPosition === "bottom-right") {
    gradientClass =
      "bg-gradient-to-tl from-[#ff0033]/20 via-transparent to-transparent";
    blurClass =
      "absolute -bottom-12 -right-8 w-48 h-48 bg-[#ff0033] rounded-full blur-[70px] opacity-30";
  } else if (glowPosition === "left") {
    gradientClass = "bg-gradient-to-r from-[#ff0033]/20 to-transparent";
    blurClass =
      "absolute top-1/2 -left-16 -translate-y-1/2 w-40 h-48 bg-[#ff0033] rounded-full blur-[60px] opacity-25";
  } else if (glowPosition === "top-left") {
    gradientClass = "bg-gradient-to-br from-[#ff0033]/[0.15] to-transparent";
    blurClass =
      "absolute -top-10 -left-10 w-40 h-40 bg-[#ff0033] rounded-full blur-[60px] opacity-20";
  }

  let transformStyle = "none";
  if (rotate === "left")
    transformStyle = "perspective(1000px) rotateY(-12deg)";
  if (rotate === "right")
    transformStyle = "perspective(1000px) rotateY(12deg)";

  return (
    <div
      className="group relative w-full lg:w-[320px] xl:w-[340px] rounded-[1.5rem] border border-white/10 bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:border-white/20 hover:brightness-110"
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={`absolute inset-0 z-0 ${gradientClass} opacity-80 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div
        className={`${blurClass} transition-opacity duration-500 group-hover:opacity-60`}
      />
      <div className="relative z-10 flex flex-col justify-start space-y-6">
        <div className="text-[#ff1a40] font-semibold text-[22px] tracking-wide">
          {number}
        </div>
        <div className="text-white text-[15px] leading-[1.6] tracking-wide font-light pr-4">
          {text1} <span className="text-zinc-300">{text2}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#07080a] text-white font-sans">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-start justify-center pointer-events-none overflow-hidden pt-[12vh] md:pt-[8vh] lg:pt-[2vh]">
          <div className="relative w-full max-w-[100vw] aspect-video origin-top scale-[0.65] md:scale-[0.8] xl:scale-[0.85]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-contain object-top opacity-85 mix-blend-screen"
            >
              <source src="/bgvideo.mp4" type="video/mp4" />
            </video>
            <div
              className="absolute bottom-[-2%] right-[-2%] w-[25%] h-[25%] z-10 block"
              style={{
                background:
                  "radial-gradient(100% 100% at 100% 100%, #07080a 60%, transparent 100%)",
              }}
            />
          </div>
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at center, transparent 25%, #07080a 100%)",
            }}
          />
        </div>

        <LandingHeader />
        <div className="h-[104px] w-full" aria-hidden="true" />

        <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-4 pb-24 min-h-[calc(100vh-100px)] flex flex-col justify-start">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start w-full max-w-[1250px] mx-auto gap-12 lg:gap-8 xl:gap-0 mt-4 xl:mt-8">
            <div className="flex flex-col space-y-8 mt-0 w-full lg:w-[320px] xl:w-[360px]">
              <h1 className="text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-lg mb-4 xl:mb-8 hidden lg:block">
                The gig economy
              </h1>
              <FeatureCard
                number="01"
                text1="Policy-Gated Execution"
                text2="ENS text records define your risk tolerance, asset limits, and kill switch — enforced on every job"
                glowPosition="bottom"
                rotate="right"
              />
              <FeatureCard
                number="03"
                text1="Encrypted Deliverables"
                text2="Per-job encryption keys ensure only you can read agent reports via Fileverse"
                glowPosition="bottom-right"
                rotate="right"
              />
            </div>

            <div className="hidden lg:block flex-1 min-w-[300px]" />

            <div className="flex flex-col space-y-8 mt-0 w-full lg:w-[360px] xl:w-[400px]">
              <h1 className="text-[3rem] tracking-tight text-white drop-shadow-lg mb-4 pb-4 lg:hidden font-semibold leading-[1.1]">
                The gig economy for AI agents onchain
              </h1>
              <h1 className="text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-lg mb-4 xl:mb-8 hidden lg:block">
                for AI agents onchain
              </h1>
              <FeatureCard
                number="02"
                text1="On-Chain Escrow"
                text2="ERC-8183 job contracts hold funds until Sentinel approves the deliverable"
                glowPosition="left"
                rotate="left"
              />
              <FeatureCard
                number="04"
                text1="Privacy-First Execution"
                text2="Your EOA never touches a DEX — intermediary wallets shield your on-chain identity"
                glowPosition="top-left"
                rotate="left"
              />
            </div>
          </div>
        </main>
      </section>

      <ProtocolRail />
      <DashboardReveal />
      <MetricsMosaic />
      <HowItWorks />
      <AgentsGrid />
      <PrivacySplitView />
      <ArchitectureOverview />
      <ComparisonCards />
      <Footer />
    </div>
  );
}
