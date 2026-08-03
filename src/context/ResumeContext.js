import { createContext, useState } from "react";

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [resumeState, setResumeState] = useState({
    fileName: "",
    skillList: [], // [{ name, category }]
    categories: {}, // { Category: [names] }
    text: "",
    resumeId: null,
    missingSkills: [],
  });

  const setResumeData = (data) => {
    setResumeState((prev) => ({ ...prev, ...data }));
  };

  const clearResume = () => {
    setResumeState({
      fileName: "",
      skillList: [],
      categories: {},
      text: "",
      resumeId: null,
      missingSkills: [],
    });
  };

  return (
    <ResumeContext.Provider
      value={{ resumeState, setResumeData, clearResume }}
    >
      {children}
    </ResumeContext.Provider>
  );
};