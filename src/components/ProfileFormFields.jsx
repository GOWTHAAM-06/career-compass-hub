import "./ProfileFormFields.css";

export const PRIMARY_ROLES = ["Student", "Fresher", "Experienced / Job Seeker"];

export const STUDENT_LEVELS = [
  "ITI",
  "Diploma",
  "Undergraduate (UG)",
  "Postgraduate (PG)",
  "Research Scholar",
];

export const TRADES_ITI = [
  "Electrician",
  "Fitter",
  "Machinist",
  "Welder",
  "Electronics Mechanic",
  "Computer Operator & Programming Assistant (COPA)",
  "Other",
];

export const TRADES_DIPLOMA = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Electronics & Communication",
  "Computer Engineering",
  "Information Technology",
  "Automobile Engineering",
  "Chemical Engineering",
  "Other",
];

export const UG_DEGREES = [
  "B.E / B.Tech",
  "B.Sc",
  "BCA",
  "B.Com",
  "BBA",
  "B.A",
  "B.Des",
  "B.Arch",
  "B.Pharm",
  "Other",
];

export const PG_DEGREES = [
  "M.Tech / M.E",
  "M.Sc",
  "MCA",
  "MBA",
  "M.A",
  "M.Com",
  "M.Des",
  "M.Pharm",
  "Other",
];

export const UG_BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Commerce",
  "Business Administration",
  "Arts & Humanities",
  "Other",
];

export const PG_BRANCHES = [
  "Computer Science",
  "Data Science",
  "Artificial Intelligence & ML",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
  "Statistics",
  "Physics",
  "Chemistry",
  "Business Administration",
  "Finance",
  "Human Resources",
  "Other",
];

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const DEFAULT_PROFILE_DATA = {
  primaryRole: "Student",
  // Student fields
  level: "ITI",
  trade: "",
  branch: "",
  year: "1st Year",
  degree: "",
  ugDetails: "",
  pgDegree: "",
  researchDomain: "",
  researchSpecialization: "",
  // Fresher fields
  highestQualification: "UG",
  fresherDegree: "",
  fresherMajor: "",
  // Common fields
  targetDomain: "",
  researchInterests: "",
  graduationYear: "",
};

const ProfileFormFields = ({ profile, onChange }) => {
  const handleChange = (e) => {
    onChange({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePrimaryRoleChange = (e) => {
    const primaryRole = e.target.value;
    const reset = { ...profile };

    reset.primaryRole = primaryRole;
    // Reset cascading fields when primary role changes
    if (primaryRole !== "Student") {
      reset.level = "";
      reset.trade = "";
      reset.branch = "";
      reset.year = "1st Year";
      reset.degree = "";
      reset.ugDetails = "";
      reset.pgDegree = "";
      reset.researchDomain = "";
      reset.researchSpecialization = "";
    }
    if (primaryRole !== "Fresher") {
      reset.highestQualification = "UG";
      reset.fresherDegree = "";
      reset.fresherMajor = "";
    }
    onChange(reset);
  };

  const primaryRole = profile.primaryRole || "Student";
  const level = profile.level || "";

  // Determine available trades based on level
  const availableTrades =
    level === "ITI" ? TRADES_ITI : level === "Diploma" ? TRADES_DIPLOMA : [];
  const isUG = level === "Undergraduate (UG)";
  const isPG = level === "Postgraduate (PG)";
  const isResearch = level === "Research Scholar";

  return (
    <div className="profile-form-fields">
      {/* Primary Role Selector */}
      <div className="profile-field">
        <label htmlFor="primaryRole">Primary Role</label>
        <select
          id="primaryRole"
          name="primaryRole"
          value={primaryRole}
          onChange={handlePrimaryRoleChange}
        >
          {PRIMARY_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- STUDENT ---------- */}
      {primaryRole === "Student" && (
        <>
          <div className="profile-field">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              name="level"
              value={level}
              onChange={handleChange}
            >
              {STUDENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* ITI / Diploma: Trade + Current Year */}
          {(level === "ITI" || level === "Diploma") && (
            <>
              <div className="profile-field">
                <label htmlFor="trade">Trade / Branch</label>
                <select
                  id="trade"
                  name="trade"
                  value={profile.trade || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Trade / Branch
                  </option>
                  {availableTrades.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="year">Current Year</label>
                <select
                  id="year"
                  name="year"
                  value={profile.year || "1st Year"}
                  onChange={handleChange}
                  required
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* UG: Degree + Branch + Year */}
          {isUG && (
            <>
              <div className="profile-field">
                <label htmlFor="degree">Degree</label>
                <select
                  id="degree"
                  name="degree"
                  value={profile.degree || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Degree
                  </option>
                  {UG_DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="branch">Branch / Major</label>
                <select
                  id="branch"
                  name="branch"
                  value={profile.branch || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {UG_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="year">Current Year</label>
                <select
                  id="year"
                  name="year"
                  value={profile.year || "1st Year"}
                  onChange={handleChange}
                  required
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* PG: UG Details + PG Degree + Branch + Year */}
          {isPG && (
            <>
              <div className="profile-field">
                <label htmlFor="ugDetails">UG Details</label>
                <input
                  id="ugDetails"
                  type="text"
                  name="ugDetails"
                  placeholder="e.g. B.Tech in Computer Science, 2024"
                  value={profile.ugDetails || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="pgDegree">PG Degree</label>
                <select
                  id="pgDegree"
                  name="pgDegree"
                  value={profile.pgDegree || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select PG Degree
                  </option>
                  {PG_DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="branch">Branch / Major</label>
                <select
                  id="branch"
                  name="branch"
                  value={profile.branch || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {PG_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="year">Current Year</label>
                <select
                  id="year"
                  name="year"
                  value={profile.year || "1st Year"}
                  onChange={handleChange}
                  required
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Research Scholar: Domain & Specialization */}
          {isResearch && (
            <>
              <div className="profile-field">
                <label htmlFor="researchDomain">Research Domain</label>
                <input
                  id="researchDomain"
                  type="text"
                  name="researchDomain"
                  placeholder="e.g. Artificial Intelligence, Nanotechnology"
                  value={profile.researchDomain || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="researchSpecialization">Specialization</label>
                <input
                  id="researchSpecialization"
                  type="text"
                  name="researchSpecialization"
                  placeholder="e.g. Deep Learning, Materials Science"
                  value={profile.researchSpecialization || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ---------- FRESHER ---------- */}
      {primaryRole === "Fresher" && (
        <>
          <div className="profile-field">
            <label htmlFor="highestQualification">Highest Qualification</label>
            <select
              id="highestQualification"
              name="highestQualification"
              value={profile.highestQualification || "UG"}
              onChange={handleChange}
            >
              <option value="ITI">ITI</option>
              <option value="Diploma">Diploma</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="fresherDegree">Degree Name</label>
            <input
              id="fresherDegree"
              type="text"
              name="fresherDegree"
              placeholder="e.g. B.Tech, B.Sc, MCA"
              value={profile.fresherDegree || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="fresherMajor">Major / Branch</label>
            <input
              id="fresherMajor"
              type="text"
              name="fresherMajor"
              placeholder="e.g. Computer Science, Commerce"
              value={profile.fresherMajor || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="graduationYear">Graduation / Passing Year</label>
            <input
              id="graduationYear"
              type="text"
              name="graduationYear"
              placeholder="e.g. 2026"
              value={profile.graduationYear || ""}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {/* ---------- EXPERIENCED ---------- */}
      {primaryRole === "Experienced / Job Seeker" && (
        <div className="experienced-banner">
          <span className="experienced-icon">🚀</span>
          <h4>Experienced Professional Hub Coming Soon!</h4>
          <p>
            We are building specialized gap-transition and layoff recovery tools.
            Stay tuned!
          </p>
        </div>
      )}

      {/* Common fields for non-experienced */}
      {primaryRole !== "Experienced / Job Seeker" && (
        <>
          <div className="profile-field">
            <label htmlFor="targetDomain">Target Domain</label>
            <input
              id="targetDomain"
              type="text"
              name="targetDomain"
              placeholder="e.g. Machine Learning, Full-Stack"
              value={profile.targetDomain || ""}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="researchInterests">Research Interests</label>
            <textarea
              id="researchInterests"
              name="researchInterests"
              placeholder="e.g. NLP, Computer Vision, Distributed Systems"
              rows={3}
              value={profile.researchInterests || ""}
              onChange={handleChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileFormFields;