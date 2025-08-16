function mouthOpen(el: SVGElement, open: boolean) {
  el.style.transform = open ? "scaleY(1.8)" : "scaleY(0.6)";
}

function typewriter(el: HTMLElement, mouth: SVGElement, text: string, cps = 22, done?: () => void) {
  el.textContent = "";
  let i = 0;
  let open = false;
  const tick = () => {
    open = !open;
    mouthOpen(mouth, open);
    el.textContent = text.slice(0, i++);
    if (i <= text.length) {
      setTimeout(() => requestAnimationFrame(tick), Math.max(6, 1000 / cps));
    } else {
      mouthOpen(mouth, false);
      done && done();
    }
  };
  tick();
}

export function lennyIntro(startScenario: (mode: string) => void) {
  const span = document.querySelector<HTMLSpanElement>("#lenny-type");
  const mouth = document.querySelector<SVGElement>("#lenny-mouth");
  const bubble = document.querySelector<HTMLDivElement>("#lenny-bubble");
  if (!span || !mouth || !bubble) return;

  const line = "Hello, I’m Lenny Lodge. I’ll guide you end to end. Ready for a quick snapshot to get us started?";
  typewriter(span, mouth, line, 22, () => {
    const cta = document.createElement("div");
    cta.style.marginTop = ".5rem";
    cta.innerHTML = `
      <button id="cta-sell" class="btn">Sell First</button>
      <button id="cta-buy" class="btn">Buy First</button>
      <button id="cta-help" class="btn btn-ghost">Help Me Decide</button>`;
    bubble.appendChild(cta);

    const go = (mode: string) => startScenario(mode);
    document.querySelector("#cta-sell")?.addEventListener("click", () => go("sell-first"));
    document.querySelector("#cta-buy")?.addEventListener("click", () => go("buy-first"));
    document.querySelector("#cta-help")?.addEventListener("click", () => go("decide"));
  });
}



