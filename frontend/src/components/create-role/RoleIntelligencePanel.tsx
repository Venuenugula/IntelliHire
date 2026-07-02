const WORKFLOW = [
  {
    step: 1,
    title: "Analyze Job Description",
    subtitle: "Extract",
    tags: ["Skills", "Responsibilities", "Experience", "Traits"],
  },
  {
    step: 2,
    title: "Generate Role DNA",
    tags: ["Role Blueprint", "Evidence Requirements", "Critical Skills", "Risk Factors"],
  },
  {
    step: 3,
    title: "Upload Candidates",
    tags: ["Resume", "GitHub", "LinkedIn", "Portfolio", "Projects"],
  },
  {
    step: 4,
    title: "Evidence Ranking",
    tags: ["Hiring Confidence", "Risk Analysis", "Recommendation"],
  },
] as const;

const PREVIEW_CHIPS = [
  "Backend Engineering",
  "Python",
  "FastAPI",
  "REST APIs",
  "PostgreSQL",
  "Distributed Systems",
  "Leadership",
  "Communication",
] as const;

const TIPS = [
  "Include responsibilities",
  "Mention required technologies",
  "Mention years of experience",
  "Mention soft skills",
  "Mention team size",
] as const;

function CheckIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
    </svg>
  );
}

export function RoleIntelligencePanel() {
  return (
    <aside className="cr-aside">
      <div className="cr-surface cr-surface--hover">
        <h2 className="cr-panel-title">How DELULU Works</h2>

        <div className="cr-workflow">
          {WORKFLOW.map((item, index) => (
            <div key={item.step}>
              <div className="cr-step">
                <div className="cr-step__marker">
                  <span className="cr-step__circle">{item.step}</span>
                  {index < WORKFLOW.length - 1 && <span className="cr-step__line" aria-hidden />}
                </div>
                <div className="cr-step__body">
                  <p className="cr-step__title">{item.title}</p>
                  {"subtitle" in item && item.subtitle && (
                    <p className="cr-step__extract">{item.subtitle}</p>
                  )}
                  <div className="cr-step__tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="cr-step__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {index < WORKFLOW.length - 1 && (
                <div className="cr-connector" aria-hidden>
                  <ArrowDown />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="cr-surface cr-surface--hover">
        <p className="cr-preview-title">Role DNA Preview</p>
        <p className="cr-preview-note">
          This blueprint will be generated after analysing the job description.
        </p>
        <div className="cr-chips">
          {PREVIEW_CHIPS.map((chip) => (
            <span key={chip} className="cr-chip">
              <CheckIcon />
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="cr-surface cr-surface--hover" style={{ padding: "24px" }}>
        <p className="cr-tips-title">Tips for Better Results</p>
        {TIPS.map((tip) => (
          <div key={tip} className="cr-tip">
            <CheckIcon />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
