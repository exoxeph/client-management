import React from "react";
import PropTypes from "prop-types";
/**
 * Project creation stepper component
 * @param {Object} props - Component props
 * @param {number} props.currentStep - Current active step (1-indexed)
 * @param {number} props.totalSteps - Total number of steps
 * @param {Function} props.onStepClick - Callback when a step is clicked
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @param {Array} props.stepValidation - Array of booleans indicating if each step is valid
 */
export const ProjectStepper = ({
  currentStep,
  totalSteps,
  onStepClick,
  darkMode = false,
  stepValidation = []
}) => {
  const steps = [{
    number: 1,
    title: "Project Basics"
  }, {
    number: 2,
    title: "Requirements"
  }, {
    number: 3,
    title: "Technical Details"
  }, {
    number: 4,
    title: "Timeline & Budget"
  }, {
    number: 5,
    title: "Documentation"
  }];
  return <div className="mb-8">
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => <React.Fragment key={step.number}>
            {/* Step Circle */}
            <button onClick={() => {
          // Only allow clicking on completed steps or the current step
          if (step.number <= currentStep) {
            onStepClick(step.number);
          }
        }} disabled={step.number > currentStep} className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${step.number < currentStep ? darkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white" : step.number === currentStep ? darkMode ? "bg-indigo-500 text-white ring-4 ring-indigo-500/30" : "bg-indigo-500 text-white ring-4 ring-indigo-500/30" : darkMode ? "bg-gray-700 text-gray-300 cursor-not-allowed" : "bg-gray-200 text-gray-700 cursor-not-allowed"} ${step.number <= currentStep ? "cursor-pointer hover:bg-indigo-700" : ""}`} aria-current={step.number === currentStep ? "step" : undefined}>
              {step.number < currentStep ? <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg> : <span className="text-sm font-medium">{step.number}</span>}
              {/* Step validation indicator */}
              {stepValidation[step.number - 1] === false && step.number <= currentStep && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>}
              {/* Step Title */}
              <span className={`absolute -bottom-8 text-xs font-medium ${step.number === currentStep ? darkMode ? "text-indigo-400" : "text-indigo-600" : darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {step.title}
              </span>
            </button>
            {/* Connector Line */}
            {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step.number < currentStep ? darkMode ? "bg-indigo-600" : "bg-indigo-600" : darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>}
          </React.Fragment>)}
      </div>
      {/* Mobile Stepper */}
      <div className="sm:hidden flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${darkMode ? "bg-indigo-500 text-white" : "bg-indigo-500 text-white"}`}>
            <span className="text-xs font-medium">{currentStep}</span>
          </div>
          <span className={`ml-2 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
            Step {currentStep}: {steps[currentStep - 1].title}
          </span>
        </div>
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {currentStep} / {totalSteps}
        </div>
      </div>
      {/* Progress Bar (Mobile Only) */}
      <div className="sm:hidden w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mb-4">
        <div className="bg-indigo-600 h-1.5 rounded-full" style={{
        width: `${currentStep / totalSteps * 100}%`
      }}></div>
      </div>
    </div>;
};
ProjectStepper.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  stepValidation: PropTypes.arrayOf(PropTypes.bool)
};
export default ProjectStepper;