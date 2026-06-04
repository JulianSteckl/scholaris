// Subject Overview — per-class workspace

function SubjectHero({ s, onOpenNotes }) {
  const sched = nbGetSchedule();
  const now = new Date();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const todayPeriod = sched.find((p) => p.subject === s.id);
  let sessionStatus = null;
  if (todayPeriod) {
    const start = schedToMinutes(todayPeriod.time);
    const end = todayPeriod.end ? schedToMinutes(todayPeriod.end) : start + 50;
    if (todayMinutes >= start && todayMinutes < end) sessionStatus = "now";
    else if (todayMinutes < start) sessionStatus = "upcoming";
    else sessionStatus = "done";
  }
  const periodNum = (SUBJECTS.indexOf(s) % 7) + 1;

  return (
    <div style={{
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 24,
      background: `linear-gradient(135deg, ${s.color}22 0%, ${s.color}08 60%, transparent 100%)`,
      border: `1px solid ${s.color}30`,
    }}>
      {/* Color bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: s.color, borderRadius: "12px 0 0 12px" }} />

      <div style={{ padding: "28px 32px 24px 36px" }}>
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase",
            letterSpacing: "0.14em", color: s.color, fontWeight: 600,
          }}>
            {s.short}
          </div>
          <div style={{ width: 1, height: 10, background: "var(--hairline)" }} />
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
            Period {periodNum} · Room {s.room} · {s.teacher}
          </div>
          {sessionStatus === "now" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, animation: "pulse 2s infinite" }} />
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: s.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>In session</div>
            </div>
          )}
          {sessionStatus === "upcoming" && (
            <div style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {todayPeriod.time} today
            </div>
          )}
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--f-display)", fontSize: 48, lineHeight: 1.02,
            margin: 0, letterSpacing: "-0.02em", color: "var(--ink)", flex: 1,
          }}>
            {s.name}
          </h1>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <button className="sn-btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: `${s.name} · Period ${periodNum} · Room ${s.room} · ${s.teacher}` }))}>Class info</button>
            <button className="sn-btn" onClick={() => onOpenNotes(s.id)} style={{ background: s.color, borderColor: s.color, color: "#fff" }}>Open notes →</button>
          </div>
        </div>

        {/* Session note */}
        {todayPeriod?.note && (
          <div style={{ marginTop: 12, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink-2)" }}>
            "{todayPeriod.note}"
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}

function SubjectSparkline({ color, height = 40, width = 130 }) {
  const pts = [78, 82, 80, 85, 84, 87, 90, 89];
  const w = width, h = height;
  const max = 100, min = 68;
  const toX = (i) => (i / (pts.length - 1)) * w;
  const toY = (p) => h - ((p - min) / (max - min)) * (h - 4) - 2;
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p).toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;
  const lastX = toX(pts.length - 1);
  const lastY = toY(pts[pts.length - 1]);
  const id = `sg-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
      <circle cx={lastX} cy={lastY} r="7" fill={color} fillOpacity="0.18" />
    </svg>
  );
}

function GradeRing({ grade, color, size = 52 }) {
  const gradeMap = { "A+": 98, "A": 94, "A-": 91, "B+": 88, "B": 84, "B-": 81, "C+": 78, "C": 74, "P": 100 };
  const pct = (gradeMap[grade] ?? 80) / 100;
  const r = 20, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--hairline)" strokeWidth="3.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
    </svg>
  );
}

function SubjectStatStrip({ s, subjectHW, subjectQuiz, onOpenQuiz }) {
  const openHW = subjectHW.filter((h) => !h.done);
  const urgentCount = openHW.filter((h) => h.urgent).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
      {/* Grade — primary stat */}
      <div className="sn-card" style={{ borderTop: `3px solid ${s.color}`, padding: "18px 20px" }}>
        <div className="sn-card-title"><span>Grade · this term</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <GradeRing grade={s.grade} color={s.color} size={56} />
            <div style={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              fontFamily: "var(--f-display)", fontSize: s.grade === "P" ? 14 : 17, fontWeight: 500, color: "var(--ink)",
            }}>{s.grade}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SubjectSparkline color={s.color} width={110} height={36} />
            <div className="mono" style={{ fontSize: 10, color: "var(--done)", marginTop: 5 }}>↑ 2.4 pts since last report</div>
          </div>
        </div>
      </div>

      {/* Open work */}
      <div className="sn-card" style={{ padding: "18px 18px" }}>
        <div className="sn-card-title"><span>Open work</span></div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 40, lineHeight: 1, color: openHW.length > 0 ? "var(--ink)" : "var(--ink-3)", marginTop: 6 }}>
          {openHW.length}
        </div>
        <div className="mono" style={{ fontSize: 10, color: urgentCount > 0 ? "var(--danger)" : "var(--ink-3)", marginTop: 5 }}>
          {urgentCount > 0 ? `${urgentCount} URGENT` : openHW.length === 0 ? "ALL CLEAR ✓" : "ON TRACK"}
        </div>
      </div>

      {/* Next class */}
      <div className="sn-card" style={{ padding: "18px 18px" }}>
        <div className="sn-card-title"><span>Next class</span></div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1, marginTop: 6 }}>Wed</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 5 }}>10:10 AM · RM {s.room.toUpperCase()}</div>
      </div>

      {/* Quiz confidence */}
      <div className="sn-card" style={{ padding: "18px 18px" }}>
        <div className="sn-card-title"><span>Quiz confidence</span></div>
        {subjectQuiz ? (
          <>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1, marginTop: 6 }}>
              {Math.round(subjectQuiz.confidence * 100)}%
            </div>
            <ConfidenceMeter value={subjectQuiz.confidence} />
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>{subjectQuiz.when.toUpperCase()}</div>
          </>
        ) : (
          <div style={{ fontFamily: "var(--f-display)", fontSize: 16, color: "var(--ink-3)", marginTop: 8, fontStyle: "italic" }}>No quiz scheduled</div>
        )}
      </div>
    </div>
  );
}

function SubjectNotesPanel({ s, subjectNotes, onOpenNotes }) {
  return (
    <div className="sn-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 17, fontWeight: 400 }}>Notes</h3>
        <a className="mono" onClick={() => onOpenNotes(s.id)} style={{ color: "var(--ink-3)", fontSize: 10, textDecoration: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          All {s.notes} →
        </a>
      </div>

      {subjectNotes.length > 0 ? (
        <div>
          {subjectNotes.map((n, i) => (
            <div key={n.id} onClick={() => onOpenNotes(s.id, n.id)}
              style={{
                padding: "14px 20px",
                borderBottom: i < subjectNotes.length - 1 ? "1px solid var(--hairline)" : "none",
                cursor: "pointer",
                transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1.3, color: "var(--ink)" }}>{n.title}</div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", flexShrink: 0 }}>{n.when}</div>
              </div>
              {n.blocks && (
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {(n.blocks.find((b) => b.type === "p") || n.blocks[0])?.text}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--ink-3)", marginBottom: 14 }}>
            Your first note for {s.short} starts here.
          </div>
          <button className="sn-btn" onClick={() => onOpenNotes(s.id)} style={{ background: s.color, borderColor: s.color, color: "#fff" }}>
            Start writing →
          </button>
        </div>
      )}

      {subjectNotes.length > 0 && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--hairline)" }}>
          <button className="sn-btn" onClick={() => onOpenNotes(s.id)} style={{ width: "100%", justifyContent: "center", background: s.color + "15", borderColor: s.color + "40", color: s.color }}>
            + New note
          </button>
        </div>
      )}
    </div>
  );
}

function SubjectHomeworkPanel({ s, subjectHW, onOpenHomework }) {
  return (
    <div className="sn-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 17, fontWeight: 400 }}>Homework</h3>
        <a className="mono" onClick={() => onOpenHomework()} style={{ color: "var(--ink-3)", fontSize: 10, textDecoration: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>All →</a>
      </div>
      {subjectHW.length > 0 ? (
        <div style={{ padding: "10px 20px 16px" }}>
          <HomeworkList items={subjectHW} compact />
        </div>
      ) : (
        <div style={{ padding: "28px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 15, color: "var(--ink-3)" }}>
            Nothing open for {s.short}. Well done.
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectSidePanel({ s, subjectQuiz, onOpenQuiz }) {
  const PINNED = {
    "ap-bio":    "Lab report needs three graphs (not two) + outliers discussion.",
    "ap-lit":    "Sethe's milk: nourishment AND theft. Use for the body paragraph on motherhood.",
    "alg2":      "When in doubt on double-angle, substitute cos²θ = 1 − sin²θ and see what cancels.",
  };
  const pinnedNote = PINNED[s.id] || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upcoming quiz — prominent if exists */}
      {subjectQuiz && (
        <div className="sn-card" style={{ padding: "18px 20px", borderLeft: `4px solid ${s.color}`, background: `${s.color}08` }}>
          <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: s.color, marginBottom: 10 }}>Upcoming quiz</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 20, lineHeight: 1.25, marginBottom: 6 }}>{subjectQuiz.title}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 12 }}>{subjectQuiz.when.toUpperCase()} · {subjectQuiz.length}</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase" }}>Confidence</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 16 }}>{Math.round(subjectQuiz.confidence * 100)}%</span>
            </div>
            <ConfidenceMeter value={subjectQuiz.confidence} />
          </div>
          <button className="sn-btn primary" onClick={() => onOpenQuiz("mcq")} style={{ width: "100%", justifyContent: "center" }}>Practice now →</button>
        </div>
      )}

      {/* Flashcard decks */}
      <div className="sn-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 15, fontWeight: 400 }}>Flashcard decks</div>
        </div>
        <div style={{ padding: "8px 0" }}>
          {(() => {
            const subjectDecks = Object.entries(DECKS).filter(([_, d]) => d.subject === s.id);
            if (subjectDecks.length === 0) {
              return (
                <div style={{ padding: "20px 18px", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13 }}>
                  No decks yet — create one to start reviewing.
                </div>
              );
            }
            const dueFor = (id) => Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 9;
            return subjectDecks.map(([deckId, d], i) => (
              <div key={deckId} onClick={() => onOpenQuiz("flashcard", deckId)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 18px",
                  borderBottom: i < subjectDecks.length - 1 ? "1px solid var(--hairline)" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div style={{ fontSize: 13.5 }}>{d.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>{d.cards.length} cards · {dueFor(deckId)} due</div>
                </div>
                <span style={{ color: "var(--ink-3)", fontSize: 13 }}>→</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Pinned margin note */}
      {pinnedNote && (
        <div style={{
          padding: "16px 18px",
          background: "var(--highlight)",
          borderRadius: 8,
          borderLeft: `3px solid var(--accent)`,
          position: "relative",
        }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--accent-ink)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Pinned note</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: "var(--ink)" }}>
            {pinnedNote}
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 10 }}>— Tue 10:24 · class</div>
        </div>
      )}
    </div>
  );
}

function SubjectOverviewContent({ subjectId, onOpenNotes, onOpenQuiz, onOpenHomework }) {
  const s = subjectBy(subjectId);
  if (!s) return null;
  const subjectHW = HOMEWORK.filter((h) => h.subject === subjectId);
  const subjectQuiz = QUIZZES_UPCOMING.find((q) => q.subject === subjectId);
  const subjectNotes = notesForSubject(subjectId).slice(0, 5);

  return (
    <>
      {/* Hero */}
      <SubjectHero s={s} onOpenNotes={onOpenNotes} />

      {/* Stat strip */}
      <SubjectStatStrip s={s} subjectHW={subjectHW} subjectQuiz={subjectQuiz} onOpenQuiz={onOpenQuiz} />

      {/* Body: 3-col grid — notes dominant */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.1fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Col 1: Notes (primary) */}
        <SubjectNotesPanel s={s} subjectNotes={subjectNotes} onOpenNotes={onOpenNotes} />

        {/* Col 2: Homework */}
        <SubjectHomeworkPanel s={s} subjectHW={subjectHW} onOpenHomework={onOpenHomework} />

        {/* Col 3: Quiz + flashcards + pinned */}
        <SubjectSidePanel s={s} subjectQuiz={subjectQuiz} onOpenQuiz={onOpenQuiz} />
      </div>
    </>
  );
}

function NoteSamplesForSubject({ subjectId, onOpen }) {
  const placeholders = {
    "ap-lit":    ["Beloved — motifs of memory", "The Great Gatsby — green light", "Toni Morrison — voice & rhythm"],
    "alg2":      ["Double-angle identities", "Law of sines", "Inverse trig functions"],
    "us-hist":   ["Federalist No. 10 — factions", "Causes of the Civil War", "Reconstruction amendments"],
    "spanish-3": ["Pretérito vs Imperfecto", "Subjuntivo — when to use", "Vocabulario Unidad 6"],
    "chem":      ["Molarity & dilutions", "Periodic trends", "Stoichiometry"],
    "studio-art":["Charcoal techniques", "Composition rules", "Color theory basics"],
    "phys-ed":   ["Workout log — May", "Mile time tracking"],
  };
  const list = placeholders[subjectId] || ["Notes will appear here"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((t, i) => (
        <div key={i} onClick={onOpen} style={{ paddingBottom: 10, borderBottom: i < list.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{t}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{["yesterday", "Mon", "last week", "Apr 30", "Apr 28"][i % 5]}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { SubjectOverviewContent });
