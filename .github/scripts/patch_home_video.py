from pathlib import Path

index = Path('index.html')
s = index.read_text(encoding='utf-8')
s = s.replace('sales.css?v=20260827-2', 'sales.css?v=20260827-video-showcase')

showcase = '''<section class="video-showcase" aria-labelledby="videoShowcaseTitle">
<div class="video-showcase-head">
<div><span class="sales-badge">✦ VIDEO SHOWCASE</span><h2 id="videoShowcaseTitle">See your ideas in motion</h2><p>Short creative previews made for scroll-stopping inspiration. Pick a style you love, then explore the Prompt marketplace.</p></div>
<button class="btn btn-secondary video-showcase-cta" type="button" data-route="prompt">Explore Prompts →</button>
</div>
<div class="video-showcase-grid">
<article class="motion-card"><div class="motion-frame"><video class="showcase-video" autoplay muted loop playsinline preload="metadata" aria-label="NEXORA Ai creative video preview 1"><source src="assets/home-videos/video-01.mp4?v=1" type="video/mp4"></video><span class="motion-badge">FEATURED</span><span class="motion-live"><i></i> LIVE PREVIEW</span></div><div class="motion-copy"><b>Cinematic Motion</b><span>Vertical AI video inspiration</span></div></article>
<article class="motion-card"><div class="motion-frame"><video class="showcase-video" autoplay muted loop playsinline preload="metadata" aria-label="NEXORA Ai creative video preview 2"><source src="assets/home-videos/video-02.mp4?v=1" type="video/mp4"></video><span class="motion-badge">TRENDING</span><span class="motion-live"><i></i> LIVE PREVIEW</span></div><div class="motion-copy"><b>Creative Story</b><span>Fast, expressive visual ideas</span></div></article>
<article class="motion-card"><div class="motion-frame"><video class="showcase-video" autoplay muted loop playsinline preload="metadata" aria-label="NEXORA Ai creative video preview 3"><source src="assets/home-videos/video-03.mp4?v=1" type="video/mp4"></video><span class="motion-badge">NEW STYLE</span><span class="motion-live"><i></i> LIVE PREVIEW</span></div><div class="motion-copy"><b>Short-Form Energy</b><span>Designed for vertical content</span></div></article>
</div>
<div class="video-showcase-foot"><span>◉ 9:16 ready</span><span>⚡ Lightweight preview</span><span>✦ Prompt inspiration</span></div>
</section>
'''

if 'class="video-showcase"' not in s:
    marker = '<div class="trust-strip">'
    if marker not in s:
        raise SystemExit('HOME trust-strip marker not found')
    s = s.replace(marker, showcase + marker, 1)
index.write_text(s, encoding='utf-8')

css = Path('sales.css')
c = css.read_text(encoding='utf-8')
block = r'''

/* Premium HOME video showcase */
.video-showcase{position:relative;isolation:isolate;overflow:hidden;margin:4px 0 34px;padding:32px;border:1px solid rgba(116,54,105,.55);border-radius:28px;background:radial-gradient(circle at 12% 0%,rgba(255,55,158,.16),transparent 34%),radial-gradient(circle at 88% 100%,rgba(103,80,255,.14),transparent 36%),linear-gradient(145deg,rgba(18,11,25,.97),rgba(10,8,17,.98));box-shadow:0 26px 60px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.025)}
.video-showcase:before{content:"";position:absolute;z-index:-1;left:18%;top:-180px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(255,68,171,.12),transparent 67%);filter:blur(16px);pointer-events:none}
.video-showcase-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}
.video-showcase-head h2{margin:10px 0 7px;font-size:34px;line-height:1.12;letter-spacing:-.035em}
.video-showcase-head p{max-width:730px;margin:0;color:#a99eac;font-size:13px;line-height:1.72}
.video-showcase-cta{flex:0 0 auto;white-space:nowrap;border-color:#5d315b!important;background:rgba(24,12,29,.76)!important}
.video-showcase-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start}
.motion-card{position:relative;min-width:0;padding:10px 10px 15px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:linear-gradient(160deg,rgba(30,17,36,.92),rgba(12,9,18,.94));box-shadow:0 18px 38px rgba(0,0,0,.24);transition:transform .32s cubic-bezier(.2,.8,.2,1),border-color .28s ease,box-shadow .32s ease}
.motion-card:nth-child(2){transform:translateY(18px)}
.motion-card:hover{transform:translateY(-8px) scale(1.012);border-color:rgba(255,88,181,.48);box-shadow:0 28px 52px rgba(0,0,0,.36),0 0 28px rgba(255,57,156,.09)}
.motion-card:nth-child(2):hover{transform:translateY(10px) scale(1.012)}
.motion-frame{position:relative;aspect-ratio:9/16;overflow:hidden;border-radius:18px;background:#09070d;box-shadow:inset 0 0 0 1px rgba(255,255,255,.04)}
.motion-frame:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,5,11,.10) 0%,transparent 38%,rgba(8,5,12,.08) 60%,rgba(8,5,12,.66) 100%);pointer-events:none}
.showcase-video{display:block;width:100%;height:100%;object-fit:cover;object-position:center;transform:scale(1.012)}
.motion-badge{position:absolute;z-index:2;left:12px;top:12px;padding:6px 9px;border:1px solid rgba(255,103,188,.38);border-radius:999px;background:rgba(18,8,23,.72);backdrop-filter:blur(10px);color:#ff7fc0;font-size:8px;font-weight:900;letter-spacing:.09em;box-shadow:0 8px 20px rgba(0,0,0,.2)}
.motion-live{position:absolute;z-index:2;right:11px;bottom:11px;display:inline-flex;align-items:center;gap:6px;padding:6px 8px;border-radius:999px;background:rgba(10,8,15,.68);backdrop-filter:blur(10px);color:#f2eaf3;font-size:8px;font-weight:800;letter-spacing:.055em}
.motion-live i{width:6px;height:6px;border-radius:50%;background:#ff4da8;box-shadow:0 0 0 4px rgba(255,77,168,.12),0 0 12px rgba(255,77,168,.8);animation:nexoraPulse 1.55s ease-in-out infinite}
@keyframes nexoraPulse{0%,100%{opacity:.62;transform:scale(.82)}50%{opacity:1;transform:scale(1.08)}}
.motion-copy{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding:13px 4px 0}
.motion-copy b{display:block;font-size:13px;letter-spacing:-.01em}
.motion-copy span{display:block;color:#8f8492;font-size:9px;text-align:right;line-height:1.35}
.video-showcase-foot{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:29px 0 0;color:#8e8491;font-size:9px;font-weight:800;letter-spacing:.035em}
.video-showcase-foot span{padding:7px 10px;border:1px solid rgba(87,53,88,.46);border-radius:999px;background:rgba(14,9,19,.48)}
@media(max-width:900px){.video-showcase{padding:25px}.video-showcase-head{align-items:flex-start;flex-direction:column}.video-showcase-cta{width:100%}.video-showcase-grid{gap:13px}.motion-card{padding:8px 8px 12px}.motion-card:nth-child(2){transform:translateY(10px)}.video-showcase-head h2{font-size:30px}}
@media(max-width:560px){.video-showcase{margin-top:0;padding:21px 16px 18px;border-radius:23px}.video-showcase-head{margin-bottom:18px}.video-showcase-head h2{font-size:27px}.video-showcase-head p{font-size:12px}.video-showcase-grid{display:flex;gap:13px;margin-right:-16px;padding-right:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.video-showcase-grid::-webkit-scrollbar{display:none}.motion-card,.motion-card:nth-child(2){flex:0 0 74vw;max-width:286px;transform:none;scroll-snap-align:start}.motion-card:hover,.motion-card:nth-child(2):hover{transform:none}.video-showcase-foot{justify-content:flex-start;gap:7px;margin-top:18px}.video-showcase-foot span{font-size:8px}}
'''
if '/* Premium HOME video showcase */' not in c:
    c += block
css.write_text(c, encoding='utf-8')
