import React from "react";

// Define the Button Component Colors;
type ButtonColor =
  | "primary"
  | "secondary"
  | "warning"
  | "error"
  | "ghost"
  | "default";

// Define the possible shapes
type ButtonShape = "circle" | "square";

// Set the interface for the button Components;
interface ButtonProperties {
  children?: React.ReactNode;
  color?: ButtonColor;
  shape?: ButtonShape;
  block?: boolean;
  wide?: boolean;
  soft?: boolean;
  // Allows any other properties (like onClick, type, etc.)
  [key: string]: any;
}

// Create the Button Component;
const Button: React.FC<ButtonProperties> = ({
  children,
  color,
  shape,
  block,
  wide,
  soft,
  ...otherProps
}) => {
  // Define the button size class.
  const baseClass = "btn btn-sm";

  // Determine the button color class based on the 'color' property.
  let colorClass = "";
  let isGhost = false;
  if (color === "primary") {
    colorClass = "btn-primary";
  } else if (color === "secondary") {
    colorClass = "btn-secondary";
  } else if (color === "warning") {
    colorClass = "btn-warning";
  } else if (color === "error") {
    colorClass = "btn-error";
  } else if (color === "ghost") {
    colorClass = "btn-ghost";
    isGhost = true;
  }

  // Determine the shape class based on the 'shape' property
  let shapeClass = "";
  if (shape === "circle") {
    shapeClass = "btn-circle";
  } else if (shape === "square") {
    shapeClass = "btn-square";
  }

  // Determine the width class ('wide' checked first based on previous state)
  let widthClass = "";
  if (wide) {
    widthClass = "btn-wide";
  } else if (block) {
    widthClass = "btn-block";
  }

  // Determine the soft class, only if 'soft' is true AND it's not a ghost button
  const softClass = soft && !isGhost ? "btn-soft" : "";

  // Combine the classes;
  const combinedClasses =
    `${baseClass} ${colorClass} ${shapeClass} ${widthClass} ${softClass}`.trim();

  // The function will return the button component;
  return (
    <section
      role="button"
      aria-label={otherProps["aria-label"] || "Button"}
      className="inline-block"
      data-component="Button"
    >
      <button
        className={combinedClasses}
        disabled={otherProps.disabled}
        {...otherProps}
      >
        {children || (shape ? null : "Default")}
      </button>
    </section>
  );
};

export default Button;