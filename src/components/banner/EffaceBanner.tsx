import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * efface 홍보 배너 — 1600×500, 6종 캐러셀.
 *
 * 자동 전환(기본 8초) + 수동 전환(← / → / 점 / 처음으로 / 방향키·Home).
 * 배너 위치 이동은 transform 대신 스크롤 위치로 처리하고, 슬라이드 모션은
 * CSS 키프레임(efSlideR1/R2, efSlideL1/L2)으로 재생합니다.
 * 컨테이너 폭이 1600px 보다 좁으면 비율을 유지한 채 축소됩니다.
 *
 * 키프레임은 src/index.css 의 "efface 홍보 배너 키프레임" 블록에 있다. (Mom-Work 에서 그대로 이식)
 */

const BOARD_W = 1600;
const NAMES = [
  "브랜드",
  "가격",
  "속도",
  "AI · 엔지니어링",
  "인수인계",
  "모집 · 실적",
] as const;

export type EffaceBannerProps = {
  /** 액센트 컬러 (기본: 로고 블루 #3b62e5) */
  accent?: string;
  /** 배너 내부 컷 전환 1사이클 길이(초) */
  cycleSeconds?: number;
  /** 배너 자동 전환 간격(초) */
  autoplaySeconds?: number;
  /** false 면 모든 애니메이션 정지 */
  animate?: boolean;
  /** 1600px 스테이지 안의 내장 컨트롤 바 표시 여부 (모바일에서는 축소되어 읽기 어려움) */
  showControls?: boolean;
  className?: string;
};

export function EffaceBanner({
  accent = "#3b62e5",
  cycleSeconds = 12,
  autoplaySeconds = 8,
  animate = true,
  showControls = false,
  className,
}: EffaceBannerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const parityRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const go = useCallback((n: number) => {
    setIndex((cur) => {
      const to = ((n % NAMES.length) + NAMES.length) % NAMES.length;
      if (to === cur) return cur;
      parityRef.current = !parityRef.current;
      const dir = n > cur ? "R" : "L";
      const track = trackRef.current;
      if (track) {
        track.style.animation = `efSlide${dir}${parityRef.current ? "1" : "2"} 620ms cubic-bezier(0.16,1,0.3,1)`;
      }
      return to;
    });
  }, []);

  useEffect(() => {
    if (viewRef.current) viewRef.current.scrollLeft = BOARD_W * index;
  }, [index]);

  useEffect(() => {
    if (!playing || !animate) return;
    const t = window.setInterval(
      () => go(indexRef.current + 1),
      autoplaySeconds * 1000,
    );
    return () => window.clearInterval(t);
  }, [playing, animate, autoplaySeconds, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 배너 위에 마우스가 있거나 배너 안에 포커스가 있을 때만 (다른 UI의 방향키를 가로채지 않도록)
      if (!rootRef.current?.matches(":hover, :focus-within")) return;
      if (e.key === "ArrowRight") go(indexRef.current + 1);
      else if (e.key === "ArrowLeft") go(indexRef.current - 1);
      else if (e.key === "Home") go(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    const fit = () => {
      const root = rootRef.current;
      const wrap = stageWrapRef.current;
      const stage = stageRef.current;
      if (!root || !wrap || !stage) return;
      const s = Math.min(1, root.clientWidth / BOARD_W);
      stage.style.transform = `scale(${s})`;
      wrap.style.height = `${Math.ceil(stage.scrollHeight * s)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  // 스와이프: 40px 이상 가로로 끌면 이전/다음
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const onSwipeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = swipe.current;
    if (!st || st.id !== e.pointerId) return;
    swipe.current = null;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    e.preventDefault();
    go(indexRef.current + (dx < 0 ? 1 : -1));
    setPlaying(false);
  };

  const stageVars = {
    "--dur": `${cycleSeconds}s`,
    "--play": animate ? "running" : "paused",
    "--ef-accent": accent,
  } as CSSProperties;

  const btn: CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 13,
    color: "#c9c9d1",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 999,
    padding: "10px 17px",
    cursor: "pointer",
  };

  return (
    <div ref={rootRef} className={className} style={{ width: "100%" }}>
      <div ref={stageWrapRef} style={{ overflow: "hidden", borderRadius: 16 }}>
        <div
          ref={stageRef}
          style={{
            ...stageVars,
            width: BOARD_W,
            transformOrigin: "top left",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontFamily:
              "'Pretendard Variable', Pretendard, system-ui, sans-serif",
          }}
        >
          <svg
            width="0"
            height="0"
            style={{
              position: "absolute",
              opacity: "0",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="efGradLight"
                x1="4"
                y1="4"
                x2="19"
                y2="20"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ffffff"></stop>
                <stop offset="0.55" stopColor="#eeeef1"></stop>
                <stop offset="1" stopColor="#b9b9c4"></stop>
              </linearGradient>
              <linearGradient
                id="efGradAccent"
                x1="12"
                y1="12"
                x2="27"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8aa2ff"></stop>
                <stop offset="0.45" stopColor="var(--ef-accent)"></stop>
                <stop offset="1" stopColor="#1a2a72"></stop>
              </linearGradient>
              <filter id="efLift" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow
                  dx="0.5"
                  dy="1.4"
                  stdDeviation="1.2"
                  floodColor="#000000"
                  floodOpacity="0.6"
                ></feDropShadow>
              </filter>
              <filter
                id="efLiftSoft"
                x="-60%"
                y="-60%"
                width="220%"
                height="220%"
              >
                <feDropShadow
                  dx="0.3"
                  dy="0.9"
                  stdDeviation="0.8"
                  floodColor="#000000"
                  floodOpacity="0.45"
                ></feDropShadow>
              </filter>
            </defs>
          </svg>

          <div
            ref={viewRef}
            style={{
              width: BOARD_W,
              overflow: "hidden",
              scrollBehavior: "auto",
              touchAction: "pan-y",
            }}
            onPointerDown={onSwipeStart}
            onPointerUp={onSwipeEnd}
            onPointerCancel={() => {
              swipe.current = null;
            }}
          >
            <div
              ref={trackRef}
              style={{ display: "flex", alignItems: "flex-start" }}
            >
              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
                      backgroundSize: "64px 64px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "-180px",
                      right: "60px",
                      width: "620px",
                      height: "620px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(59,98,229,0.42), transparent 62%)",
                      filter: "blur(18px)",
                      animation:
                        "efGlow calc(var(--dur) / 3) ease-in-out infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      bottom: "0",
                      left: "0",
                      width: "300px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.08) 60%, transparent)",
                      mixBlendMode: "screen",
                      animation:
                        "efSheen calc(var(--dur) / 3) cubic-bezier(0.5,0,0.4,1) infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "22px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                          }}
                        >
                          <svg
                            viewBox="0 0 32 32"
                            width="30"
                            height="30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              overflow: "visible",
                              animation: "efTiltS 7s ease-in-out infinite",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <rect
                              x="6.7"
                              y="6.7"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="#7c7c86"
                            ></rect>
                            <rect
                              x="6.1"
                              y="6.1"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="#a8a8b3"
                            ></rect>
                            <rect
                              x="5.5"
                              y="5.5"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="url(#efGradLight)"
                              filter="url(#efLiftSoft)"
                            ></rect>
                            <rect
                              x="6.1"
                              y="6.1"
                              width="11.8"
                              height="11.8"
                              rx="3.2"
                              stroke="#ffffff"
                              strokeOpacity="0.85"
                              strokeWidth="0.5"
                              fill="none"
                            ></rect>
                            <rect
                              x="14.7"
                              y="14.7"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="#101a4a"
                            ></rect>
                            <rect
                              x="14.1"
                              y="14.1"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="#1d2e71"
                            ></rect>
                            <rect
                              x="13.5"
                              y="13.5"
                              width="13"
                              height="13"
                              rx="3.6"
                              fill="url(#efGradAccent)"
                              filter="url(#efLift)"
                            ></rect>
                            <rect
                              x="14.1"
                              y="14.1"
                              width="11.8"
                              height="11.8"
                              rx="3.2"
                              stroke="#ffffff"
                              strokeOpacity="0.4"
                              strokeWidth="0.5"
                              fill="none"
                            ></rect>
                          </svg>
                          <span
                            style={{
                              fontSize: "23px",
                              fontWeight: "600",
                              letterSpacing: "-0.035em",
                            }}
                          >
                            efface
                          </span>
                        </div>
                        <div
                          style={{
                            width: "1px",
                            height: "24px",
                            background: "rgba(255,255,255,0.16)",
                          }}
                        ></div>
                        <div
                          style={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "11.5px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "#9b9ba4",
                          }}
                        >
                          WEB · COMMERCE · ADMIN · AI
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "11.5px",
                          letterSpacing: "0.1em",
                          color: "#9b9ba4",
                          border: "1px solid rgba(255,255,255,0.16)",
                          borderRadius: "999px",
                          padding: "7px 15px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--ef-accent)",
                            animation: "efDot 2.2s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        ></span>
                        2026 Q3 신규 프로젝트 모집 중
                      </div>
                    </div>

                    <div
                      style={{
                        position: "relative",
                        flex: "1",
                        margin: "22px 0",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          display: "flex",
                          alignItems: "center",
                          animation: "efCut3A var(--dur) linear infinite both",
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{ overflow: "hidden", paddingBottom: "6px" }}
                          >
                            <h1
                              style={{
                                margin: "0",
                                fontSize: "62px",
                                lineHeight: "1.12",
                                fontWeight: "700",
                                letterSpacing: "-0.035em",
                                animation:
                                  "efRiseA var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                                animationPlayState: "var(--play)",
                              }}
                            >
                              웹사이트 외주, 막막하셨다면.
                            </h1>
                          </div>
                          <div
                            style={{
                              fontSize: "20px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                              animation:
                                "efPopA var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            기획 · 디자인 · 개발 · 배포까지 한 곳에서.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          display: "flex",
                          alignItems: "center",
                          animation: "efCut3 var(--dur) linear infinite both",
                          animationDelay: "calc(var(--dur) * 0.3334)",
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{ overflow: "hidden", paddingBottom: "6px" }}
                          >
                            <h1
                              style={{
                                margin: "0",
                                fontSize: "62px",
                                lineHeight: "1.12",
                                fontWeight: "700",
                                letterSpacing: "-0.035em",
                                animation:
                                  "efRise var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                                animationDelay: "calc(var(--dur) * 0.3334)",
                                animationPlayState: "var(--play)",
                              }}
                            >
                              Erase the complexity.{" "}
                              <span
                                style={{
                                  color: "var(--ef-accent)",
                                  textDecoration: "line-through",
                                }}
                              >
                                Keep
                              </span>{" "}
                              the effect.
                            </h1>
                          </div>
                          <div
                            style={{
                              fontSize: "20px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                              animation:
                                "efPop var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationDelay: "calc(var(--dur) * 0.3534)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            필요한 것만 남기는 웹 외주 제작 스튜디오.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          display: "flex",
                          alignItems: "center",
                          animation: "efCut3 var(--dur) linear infinite both",
                          animationDelay: "calc(var(--dur) * 0.6667)",
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{ overflow: "hidden", paddingBottom: "6px" }}
                          >
                            <h1
                              style={{
                                margin: "0",
                                fontSize: "62px",
                                lineHeight: "1.12",
                                fontWeight: "700",
                                letterSpacing: "-0.035em",
                                animation:
                                  "efRise var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                                animationDelay: "calc(var(--dur) * 0.6667)",
                                animationPlayState: "var(--play)",
                              }}
                            >
                              1~3주, 35만원부터 시작합니다.
                            </h1>
                          </div>
                          <div
                            style={{
                              fontSize: "20px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                              animation:
                                "efPop var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationDelay: "calc(var(--dur) * 0.6867)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            랜딩 · 기업 사이트 · 쇼핑몰 · 사내 관리툴
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "8px",
                          width: "164px",
                          height: "164px",
                          marginTop: "-82px",
                          perspective: "800px",
                          animation:
                            "efMark calc(var(--dur) / 3) cubic-bezier(0.16,1,0.3,1) infinite both",
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="164"
                          height="164"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            filter: "drop-shadow(0 26px 40px rgba(0,0,0,0.65))",
                            animation: "efTiltL 9s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.9"
                            strokeWidth="0.45"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.45"
                            strokeWidth="0.45"
                            fill="none"
                          ></rect>
                        </svg>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.09)",
                        paddingTop: "22px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#c9c9d1",
                        }}
                      >
                        <span>랜딩 35만원부터</span>
                        <span style={{ color: "#45454e" }}>/</span>
                        <span>1~3주 납품</span>
                        <span style={{ color: "#45454e" }}>/</span>
                        <span>1개월 무상 유지보수</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "22px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "13.5px",
                            color: "#9b9ba4",
                          }}
                        >
                          efface.dev
                          <span
                            style={{
                              animation: "efCaret 1.1s steps(1) infinite",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            _
                          </span>
                        </div>
                        <a
                          href="https://efface.dev/"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "var(--ef-accent)",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "600",
                            padding: "14px 26px",
                            borderRadius: "999px",
                            textDecoration: "none",
                            pointerEvents: "auto",
                          }}
                        >
                          무료 견적 받기
                          <span
                            style={{
                              animation:
                                "efNudge var(--dur) ease-in-out infinite",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            →
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                      backgroundSize: "50px 50px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-260px",
                      left: "420px",
                      width: "760px",
                      height: "560px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(59,98,229,0.3), transparent 65%)",
                      filter: "blur(20px)",
                      animation:
                        "efGlow calc(var(--dur) / 3) ease-in-out infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      bottom: "0",
                      left: "0",
                      width: "260px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.07) 60%, transparent)",
                      mixBlendMode: "screen",
                      animation:
                        "efSheen calc(var(--dur) / 3) cubic-bezier(0.5,0,0.4,1) infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="30"
                          height="30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            animation: "efTiltS 7s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.85"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                        </svg>
                        <span
                          style={{
                            fontSize: "23px",
                            fontWeight: "600",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          efface
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "11.5px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#9b9ba4",
                        }}
                      >
                        // PRICING · 부가세 별도 · 참고 견적
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "48px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "18px",
                        }}
                      >
                        <div
                          style={{ overflow: "hidden", paddingBottom: "4px" }}
                        >
                          <div
                            style={{
                              fontSize: "31px",
                              fontWeight: "700",
                              letterSpacing: "-0.03em",
                              color: "#f6f6f7",
                              animation:
                                "efRiseH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            견적, 처음부터 공개합니다.
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "18px",
                          }}
                        >
                          <div style={{ height: "104px", overflow: "hidden" }}>
                            <div
                              style={{
                                animation:
                                  "efRoll4 var(--dur) cubic-bezier(0.7,0,0.2,1) infinite",
                                animationPlayState: "var(--play)",
                              }}
                            >
                              <div
                                style={{
                                  height: "104px",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "86px",
                                  fontWeight: "700",
                                  letterSpacing: "-0.045em",
                                  lineHeight: "1",
                                }}
                              >
                                35만원
                              </div>
                              <div
                                style={{
                                  height: "104px",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "86px",
                                  fontWeight: "700",
                                  letterSpacing: "-0.045em",
                                  lineHeight: "1",
                                }}
                              >
                                60만원
                              </div>
                              <div
                                style={{
                                  height: "104px",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "86px",
                                  fontWeight: "700",
                                  letterSpacing: "-0.045em",
                                  lineHeight: "1",
                                }}
                              >
                                70만원
                              </div>
                              <div
                                style={{
                                  height: "104px",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "86px",
                                  fontWeight: "700",
                                  letterSpacing: "-0.045em",
                                  lineHeight: "1",
                                }}
                              >
                                35만원
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "34px",
                              fontWeight: "600",
                              color: "#9b9ba4",
                              letterSpacing: "-0.03em",
                              paddingBottom: "12px",
                            }}
                          >
                            부터
                          </div>
                        </div>
                        <div style={{ position: "relative", height: "26px" }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "15px",
                              color: "#c9c9d1",
                              animation:
                                "efCut3A var(--dur) linear infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            랜딩 페이지 · 1페이지 · 1~2주
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "15px",
                              color: "#c9c9d1",
                              animation:
                                "efCut3 var(--dur) linear infinite both",
                              animationDelay: "calc(var(--dur) * 0.3334)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            기업 · 브랜드 사이트 · 5~10페이지 · 2~3주
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "15px",
                              color: "#c9c9d1",
                              animation:
                                "efCut3 var(--dur) linear infinite both",
                              animationDelay: "calc(var(--dur) * 0.6667)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            쇼핑몰 · 커머스 · 결제 연동 · 3~5주
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: "420px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                          borderLeft: "1px solid rgba(255,255,255,0.12)",
                          paddingLeft: "32px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "11px",
                            letterSpacing: "0.2em",
                            color: "#6a6a73",
                          }}
                        >
                          INCLUDED
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "11px",
                            fontSize: "16px",
                            color: "#c9c9d1",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                              animation:
                                "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "var(--ef-accent)",
                              }}
                            ></span>
                            반응형 · 기본 SEO · OG 태그
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                              animation:
                                "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationDelay: "calc(var(--dur) * 0.015)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "var(--ef-accent)",
                              }}
                            ></span>
                            Vercel 배포 · 도메인 연결
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                              animation:
                                "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationDelay: "calc(var(--dur) * 0.03)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "var(--ef-accent)",
                              }}
                            ></span>
                            GitHub 이관 · 운영 가이드
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                              animation:
                                "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationDelay: "calc(var(--dur) * 0.045)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "var(--ef-accent)",
                              }}
                            ></span>
                            1개월 무상 유지보수
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.09)",
                        paddingTop: "22px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#9b9ba4",
                        }}
                      >
                        efface.dev/apply
                        <span
                          style={{
                            animation: "efCaret 1.1s steps(1) infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          _
                        </span>
                      </div>
                      <a
                        href="https://efface.dev/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#f6f6f7",
                          color: "#0a0a0b",
                          fontSize: "16px",
                          fontWeight: "600",
                          padding: "14px 26px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          pointerEvents: "auto",
                        }}
                      >
                        1분 견적 계산기
                        <span
                          style={{
                            animation:
                              "efNudge var(--dur) ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
                      backgroundSize: "64px 64px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "-140px",
                      left: "-80px",
                      width: "620px",
                      height: "620px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(59,98,229,0.34), transparent 62%)",
                      filter: "blur(20px)",
                      animation:
                        "efGlow calc(var(--dur) / 3) ease-in-out infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      right: "0",
                      top: "0",
                      height: "2px",
                      background:
                        "linear-gradient(90deg, transparent, var(--ef-accent), transparent)",
                      animation: "efScan var(--dur) linear infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="30"
                          height="30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            animation: "efTiltS 7s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.85"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                        </svg>
                        <span
                          style={{
                            fontSize: "23px",
                            fontWeight: "600",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          efface
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "11.5px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#9b9ba4",
                        }}
                      >
                        // PROCESS · 평균 2~4주
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "30px",
                      }}
                    >
                      <div style={{ overflow: "hidden", paddingBottom: "6px" }}>
                        <h1
                          style={{
                            margin: "0",
                            fontSize: "58px",
                            lineHeight: "1.12",
                            fontWeight: "700",
                            letterSpacing: "-0.035em",
                            animation:
                              "efRiseH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          상담부터 인계까지,{" "}
                          <span style={{ color: "var(--ef-accent)" }}>
                            1~3주.
                          </span>
                        </h1>
                      </div>
                      <div
                        style={{
                          position: "relative",
                          height: "3px",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            background: "var(--ef-accent)",
                            transformOrigin: "left",
                            animation: "efFill var(--dur) linear infinite",
                            animationPlayState: "var(--play)",
                          }}
                        ></div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                          gap: "40px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "9px",
                            animation:
                              "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.16em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            01 · 1~2일
                          </div>
                          <div
                            style={{
                              fontSize: "23px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            상담 · 견적
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.55",
                              color: "#9b9ba4",
                            }}
                          >
                            신청폼 제출 후 1영업일 내 회신, 1차 견적과 일정 초안
                            전달.
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "9px",
                            animation:
                              "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                            animationDelay: "calc(var(--dur) * 0.3334)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.16em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            02 · 1~3주
                          </div>
                          <div
                            style={{
                              fontSize: "23px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            디자인 · 개발
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.55",
                              color: "#9b9ba4",
                            }}
                          >
                            Figma 시안 검토 후 개발. 매주 스테이징 미리보기
                            공유.
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "9px",
                            animation:
                              "efPopH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                            animationDelay: "calc(var(--dur) * 0.6667)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.16em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            03 · 1~2일
                          </div>
                          <div
                            style={{
                              fontSize: "23px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            배포 · 인계
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.55",
                              color: "#9b9ba4",
                            }}
                          >
                            도메인 연결, 배포, 운영 문서까지. 1개월 무상
                            유지보수.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.09)",
                        paddingTop: "22px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#c9c9d1",
                        }}
                      >
                        <span>1영업일 내 회신</span>
                        <span style={{ color: "#45454e" }}>/</span>
                        <span>견적 확정 후 평균 3일 내 착수</span>
                      </div>
                      <a
                        href="https://efface.dev/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "var(--ef-accent)",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "600",
                          padding: "14px 26px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          pointerEvents: "auto",
                        }}
                      >
                        일정 상담하기
                        <span
                          style={{
                            animation:
                              "efNudge var(--dur) ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      background:
                        "radial-gradient(70% 120% at 78% 50%, rgba(59,98,229,0.26), transparent 62%)",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
                      backgroundSize: "56px 56px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      bottom: "0",
                      left: "0",
                      width: "280px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0.07) 60%, transparent)",
                      mixBlendMode: "screen",
                      animation:
                        "efSheen calc(var(--dur) / 4) cubic-bezier(0.5,0,0.4,1) infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="30"
                          height="30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            animation: "efTiltS 7s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.85"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                        </svg>
                        <span
                          style={{
                            fontSize: "23px",
                            fontWeight: "600",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          efface
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "11.5px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#9b9ba4",
                        }}
                      >
                        // CAPABILITIES · AI · WEB · APP · INFRA
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "56px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "720px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "22px",
                        }}
                      >
                        <div
                          style={{ overflow: "hidden", paddingBottom: "6px" }}
                        >
                          <h1
                            style={{
                              margin: "0",
                              fontSize: "56px",
                              lineHeight: "1.14",
                              fontWeight: "700",
                              letterSpacing: "-0.035em",
                              animation:
                                "efRiseH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            AI까지 다루는
                            <br />
                            엔지니어링 팀.
                          </h1>
                        </div>
                        <div
                          style={{
                            fontSize: "19px",
                            lineHeight: "1.6",
                            color: "#9b9ba4",
                            textWrap: "pretty",
                          }}
                        >
                          LLM 기능부터 웹, 앱, 인프라까지. 데모에서 멈추지 않고
                          실제 제품에 넣어 검증합니다.
                        </div>
                      </div>

                      <div
                        style={{
                          position: "relative",
                          width: "600px",
                          height: "210px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(20,20,24,0.72)",
                          padding: "30px 34px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            padding: "30px 34px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            animation:
                              "efCut4A var(--dur) linear infinite both",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.18em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            01 / AI ENGINEERING
                          </div>
                          <div
                            style={{
                              fontSize: "27px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            LLM 기능 설계 · 구축 · 배포
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                            }}
                          >
                            에이전트, 툴 콜링, 자동화 파이프라인, 운영에서
                            버티는 RAG.
                          </div>
                          <div
                            style={{
                              marginTop: "auto",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#6a6a73",
                            }}
                          >
                            Claude · OpenAI · Vercel AI SDK · pgvector
                          </div>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            padding: "30px 34px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            animation: "efCut4 var(--dur) linear infinite both",
                            animationDelay: "calc(var(--dur) * 0.25)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.18em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            02 / WEB ENGINEERING
                          </div>
                          <div
                            style={{
                              fontSize: "27px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            Next.js App Router 풀스택
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                            }}
                          >
                            서버 컴포넌트, 스트리밍, 캐싱 전략. i18n · SEO ·
                            접근성은 기본.
                          </div>
                          <div
                            style={{
                              marginTop: "auto",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#6a6a73",
                            }}
                          >
                            Next.js · React · TypeScript · Tailwind CSS
                          </div>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            padding: "30px 34px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            animation: "efCut4 var(--dur) linear infinite both",
                            animationDelay: "calc(var(--dur) * 0.5)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.18em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            03 / APPS & INTERACTION
                          </div>
                          <div
                            style={{
                              fontSize: "27px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            웹앱 · 대시보드 · 모바일
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                            }}
                          >
                            어드민 도구, PWA, WebGL과 3D 모션 인터랙션까지.
                          </div>
                          <div
                            style={{
                              marginTop: "auto",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#6a6a73",
                            }}
                          >
                            React Native · Swift · Kotlin · Three.js
                          </div>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            padding: "30px 34px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            animation: "efCut4 var(--dur) linear infinite both",
                            animationDelay: "calc(var(--dur) * 0.75)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              letterSpacing: "0.18em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            04 / INFRA & DATA
                          </div>
                          <div
                            style={{
                              fontSize: "27px",
                              fontWeight: "600",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            배포 · CI/CD · 모니터링
                          </div>
                          <div
                            style={{
                              fontSize: "15.5px",
                              lineHeight: "1.6",
                              color: "#9b9ba4",
                            }}
                          >
                            DB 설계와 마이그레이션, 인증·결제 연동, 성능과 비용
                            튜닝.
                          </div>
                          <div
                            style={{
                              marginTop: "auto",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#6a6a73",
                            }}
                          >
                            Vercel · AWS · Supabase · PostgreSQL
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.09)",
                        paddingTop: "22px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#9b9ba4",
                        }}
                      >
                        v2.efface.dev
                        <span
                          style={{
                            animation: "efCaret 1.1s steps(1) infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          _
                        </span>
                      </div>
                      <a
                        href="https://v2.efface.dev/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "var(--ef-accent)",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "600",
                          padding: "14px 26px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          pointerEvents: "auto",
                        }}
                      >
                        기술 상담 요청
                        <span
                          style={{
                            animation:
                              "efNudge var(--dur) ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-200px",
                      right: "-60px",
                      width: "640px",
                      height: "520px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(59,98,229,0.3), transparent 64%)",
                      filter: "blur(22px)",
                      animation:
                        "efGlow calc(var(--dur) / 3) ease-in-out infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="30"
                          height="30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            animation: "efTiltS 7s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.85"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                        </svg>
                        <span
                          style={{
                            fontSize: "23px",
                            fontWeight: "600",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          efface
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "11.5px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#9b9ba4",
                        }}
                      >
                        // HANDOFF · 검증된 기술만
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "56px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "640px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "22px",
                        }}
                      >
                        <div
                          style={{ overflow: "hidden", paddingBottom: "6px" }}
                        >
                          <h1
                            style={{
                              margin: "0",
                              fontSize: "54px",
                              lineHeight: "1.14",
                              fontWeight: "700",
                              letterSpacing: "-0.035em",
                              animation:
                                "efRiseH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            넘겨받기 좋은
                            <br />
                            코드로 마무리합니다.
                          </h1>
                        </div>
                        <div
                          style={{
                            fontSize: "19px",
                            lineHeight: "1.6",
                            color: "#9b9ba4",
                            textWrap: "pretty",
                          }}
                        >
                          TypeScript · 일관된 컨벤션 · README와 운영 가이드
                          동봉. 다른 개발자에게 인계해도 막히지 않습니다.
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <span
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#c9c9d1",
                              border: "1px solid rgba(255,255,255,0.14)",
                              padding: "8px 13px",
                            }}
                          >
                            GitHub 권한 이관
                          </span>
                          <span
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#c9c9d1",
                              border: "1px solid rgba(255,255,255,0.14)",
                              padding: "8px 13px",
                            }}
                          >
                            운영 가이드
                          </span>
                          <span
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "13px",
                              color: "#c9c9d1",
                              border: "1px solid rgba(255,255,255,0.14)",
                              padding: "8px 13px",
                            }}
                          >
                            1개월 무상 유지보수
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          position: "relative",
                          width: "620px",
                          height: "236px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "#101013",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            padding: "12px 18px",
                          }}
                        >
                          <span
                            style={{
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              background: "#45454e",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              background: "#45454e",
                            }}
                          ></span>
                          <span
                            style={{
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              background: "var(--ef-accent)",
                              animation: "efDot 2.2s ease-in-out infinite",
                              animationPlayState: "var(--play)",
                            }}
                          ></span>
                          <span
                            style={{
                              marginLeft: "8px",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "12px",
                              color: "#6a6a73",
                            }}
                          >
                            project.config.ts
                          </span>
                        </div>
                        <div style={{ position: "relative", height: "180px" }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              padding: "20px 22px",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "14.5px",
                              lineHeight: "1.85",
                              color: "#c9c9d1",
                              boxSizing: "border-box",
                              animation:
                                "efCut3A var(--dur) linear infinite both",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <div style={{ color: "#6a6a73" }}>
                              // 의뢰 시 받게 되는 결과물
                            </div>
                            <div>
                              type:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "Next.js 15 + TypeScript"
                              </span>
                            </div>
                            <div>
                              design:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "Figma · Tailwind CSS"
                              </span>
                            </div>
                            <div>
                              timeline:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "1~3주"
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              padding: "20px 22px",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "14.5px",
                              lineHeight: "1.85",
                              color: "#c9c9d1",
                              boxSizing: "border-box",
                              animation:
                                "efCut3 var(--dur) linear infinite both",
                              animationDelay: "calc(var(--dur) * 0.3334)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <div style={{ color: "#6a6a73" }}>// handoff</div>
                            <div>
                              repo:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "GitHub 권한 이관"
                              </span>
                            </div>
                            <div>
                              docs:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "README · 운영 가이드"
                              </span>
                            </div>
                            <div>
                              support:{" "}
                              <span style={{ color: "var(--ef-accent)" }}>
                                "1개월 무상 유지보수"
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0",
                              padding: "20px 22px",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                              fontSize: "14.5px",
                              lineHeight: "1.85",
                              color: "#c9c9d1",
                              boxSizing: "border-box",
                              animation:
                                "efCut3 var(--dur) linear infinite both",
                              animationDelay: "calc(var(--dur) * 0.6667)",
                              animationPlayState: "var(--play)",
                            }}
                          >
                            <div style={{ color: "#6a6a73" }}>
                              $ npm run build
                            </div>
                            <div>✓ compiled successfully</div>
                            <div>✓ deployed to vercel</div>
                            <div style={{ color: "var(--ef-accent)" }}>
                              ready to ship
                              <span
                                style={{
                                  animation: "efCaret 1.1s steps(1) infinite",
                                  animationPlayState: "var(--play)",
                                }}
                              >
                                _
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.09)",
                        paddingTop: "22px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#c9c9d1",
                        }}
                      >
                        <span>25 tools</span>
                        <span style={{ color: "#45454e" }}>/</span>
                        <span>표준 도구만 사용</span>
                        <span style={{ color: "#45454e" }}>/</span>
                        <span>자체 운영 가능</span>
                      </div>
                      <a
                        href="https://efface.dev/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#f6f6f7",
                          color: "#0a0a0b",
                          fontSize: "16px",
                          fontWeight: "600",
                          padding: "14px 26px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          pointerEvents: "auto",
                        }}
                      >
                        작업 사례 보기
                        <span
                          style={{
                            animation:
                              "efNudge var(--dur) ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: "1600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    width: "1600px",
                    height: "500px",
                    overflow: "hidden",
                    background: "#0a0a0b",
                    color: "#f6f6f7",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      background:
                        "radial-gradient(90% 140% at 50% 120%, rgba(59,98,229,0.28), transparent 60%)",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
                      backgroundSize: "64px 64px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      bottom: "0",
                      left: "0",
                      width: "320px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.08) 60%, transparent)",
                      mixBlendMode: "screen",
                      animation:
                        "efSheen calc(var(--dur) / 3) cubic-bezier(0.5,0,0.4,1) infinite",
                      animationPlayState: "var(--play)",
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      padding: "44px 64px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          animation: "efFloat 5s ease-in-out infinite",
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="44"
                          height="44"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            overflow: "visible",
                            animation: "efTiltL 8s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <rect
                            x="6.7"
                            y="6.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#7c7c86"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#a8a8b3"
                          ></rect>
                          <rect
                            x="5.5"
                            y="5.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradLight)"
                            filter="url(#efLiftSoft)"
                          ></rect>
                          <rect
                            x="6.1"
                            y="6.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.85"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                          <rect
                            x="14.7"
                            y="14.7"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#101a4a"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="#1d2e71"
                          ></rect>
                          <rect
                            x="13.5"
                            y="13.5"
                            width="13"
                            height="13"
                            rx="3.6"
                            fill="url(#efGradAccent)"
                            filter="url(#efLift)"
                          ></rect>
                          <rect
                            x="14.1"
                            y="14.1"
                            width="11.8"
                            height="11.8"
                            rx="3.2"
                            stroke="#ffffff"
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                            fill="none"
                          ></rect>
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: "26px",
                          fontWeight: "600",
                          letterSpacing: "-0.035em",
                        }}
                      >
                        efface
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "12px",
                          letterSpacing: "0.16em",
                          color: "#f6f6f7",
                          background: "rgba(59,98,229,0.22)",
                          border: "1px solid var(--ef-accent)",
                          borderRadius: "999px",
                          padding: "8px 17px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--ef-accent)",
                            animation: "efDot 2.2s ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        ></span>
                        2026 Q3 신규 프로젝트 모집 중
                      </div>
                      <div style={{ overflow: "hidden", paddingBottom: "8px" }}>
                        <h1
                          style={{
                            margin: "0",
                            fontSize: "64px",
                            lineHeight: "1.12",
                            fontWeight: "700",
                            letterSpacing: "-0.04em",
                            animation:
                              "efRiseH var(--dur) cubic-bezier(0.16,1,0.3,1) infinite both",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          프로젝트, 시작해 볼까요?
                        </h1>
                      </div>
                      <div
                        style={{
                          position: "relative",
                          width: "900px",
                          height: "30px",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "14px",
                            animation:
                              "efCut3A var(--dur) linear infinite both",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "25px",
                              fontWeight: "600",
                              letterSpacing: "-0.02em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            30개+
                          </span>
                          <span style={{ fontSize: "19px", color: "#9b9ba4" }}>
                            완료한 프로젝트
                          </span>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "14px",
                            animation: "efCut3 var(--dur) linear infinite both",
                            animationDelay: "calc(var(--dur) * 0.3334)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "25px",
                              fontWeight: "600",
                              letterSpacing: "-0.02em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            4.9 / 5.0
                          </span>
                          <span style={{ fontSize: "19px", color: "#9b9ba4" }}>
                            평균 만족도
                          </span>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            inset: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "14px",
                            animation: "efCut3 var(--dur) linear infinite both",
                            animationDelay: "calc(var(--dur) * 0.6667)",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "25px",
                              fontWeight: "600",
                              letterSpacing: "-0.02em",
                              color: "var(--ef-accent)",
                            }}
                          >
                            24시간 내
                          </span>
                          <span style={{ fontSize: "19px", color: "#9b9ba4" }}>
                            평일 응답 시간
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "18px",
                      }}
                    >
                      <a
                        href="https://efface.dev/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "var(--ef-accent)",
                          color: "#fff",
                          fontSize: "17px",
                          fontWeight: "600",
                          padding: "16px 32px",
                          borderRadius: "999px",
                          textDecoration: "none",
                          pointerEvents: "auto",
                        }}
                      >
                        무료 견적 받기
                        <span
                          style={{
                            animation:
                              "efNudge var(--dur) ease-in-out infinite",
                            animationPlayState: "var(--play)",
                          }}
                        >
                          →
                        </span>
                      </a>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                          fontSize: "13.5px",
                          color: "#9b9ba4",
                        }}
                      >
                        efface.dev · v2.efface.dev · contact@efface.dev
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showControls && (
            <div
              style={{
                width: BOARD_W,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                padding: "16px 22px",
                border: "1px solid rgba(255,255,255,0.09)",
                background: "#0a0a0b",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button type="button" onClick={() => go(0)} style={btn}>
                  ↺ 처음으로
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  style={btn}
                >
                  {playing ? "❚❚ 자동 전환 중" : "▶ 자동 전환"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {NAMES.map((name, n) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={`${n + 1}번 배너 — ${name}`}
                      onClick={() => go(n)}
                      style={{
                        width: n === index ? 34 : 8,
                        height: 7,
                        border: "none",
                        borderRadius: 999,
                        padding: 0,
                        cursor: "pointer",
                        background:
                          n === index
                            ? "var(--ef-accent)"
                            : "rgba(255,255,255,0.22)",
                        transition:
                          "width 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    letterSpacing: "0.06em",
                    color: "#9b9ba4",
                    minWidth: 190,
                  }}
                >
                  {String(index + 1).padStart(2, "0")} / 06 · {NAMES[index]}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  style={{
                    ...btn,
                    fontSize: 15,
                    width: 44,
                    height: 40,
                    padding: 0,
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  style={{
                    ...btn,
                    fontSize: 15,
                    width: 44,
                    height: 40,
                    padding: 0,
                    color: "#fff",
                    background: "var(--ef-accent)",
                    border: "1px solid var(--ef-accent)",
                  }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {!showControls && (
        <div
          className="flex items-center justify-between gap-3 px-1 pt-3"
          style={{ background: "transparent" }}
        >
          <button
            type="button"
            aria-label={playing ? "자동 전환 멈춤" : "자동 전환 시작"}
            onClick={() => setPlaying((p) => !p)}
            className="h-8 rounded-full px-3 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            {playing ? "❚❚ 자동" : "▶ 자동"}
          </button>
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="배너 선택"
          >
            {NAMES.map((name, n) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={n === index}
                aria-label={`${n + 1}번 배너 — ${name}`}
                onClick={() => {
                  go(n);
                  setPlaying(false);
                }}
                className="flex h-6 items-center px-0.5"
              >
                <span
                  className="block h-1.5 rounded-full transition-[width,background-color] duration-300"
                  style={{
                    width: n === index ? 22 : 6,
                    background: n === index ? accent : "rgba(0,0,0,0.18)",
                  }}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="이전 배너"
              onClick={() => {
                go(index - 1);
                setPlaying(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="다음 배너"
              onClick={() => {
                go(index + 1);
                setPlaying(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
