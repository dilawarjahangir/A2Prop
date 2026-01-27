import React, { useState } from "react";
import { Link } from "react-router-dom";

const isInternalPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const GradientButton = ({ children, href = "#", to, className = "", ...rest }) => {
  const [hovered, setHovered] = useState(false);

  const gradient = hovered
    ? "linear-gradient(93.6deg, #999999 28.26%, #FFFFFF 106.64%)"
    : "linear-gradient(93.6deg, #FFFFFF 28.26%, #999999 106.64%)";

  const internalTarget = typeof to === "string" ? to : isInternalPath(href) ? href : null;
  const Component = internalTarget ? Link : "a";
  const linkProps = internalTarget ? { to: internalTarget } : { href };

  return (
    <Component
      {...linkProps}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-[#111] shadow-sm transition-transform duration-150 active:scale-95 ${className}`}
      style={{ background: gradient }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default GradientButton;
