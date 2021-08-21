import React from "react";
import styles from "./App.module.css";

// label component
// fragment and reuseable; type's default value set to text
const InputWithLabel = ({
  id,
  value,
  type = "text",
  isFocused,
  onInputChange,
  children,
}) => {
  // mutable field
  const inputRef = React.useRef();

  // triggers function when isFocused changes
  React.useEffect(() => {
    if (isFocused && inputRef.current) inputRef.current.focus();
  }, [isFocused]);

  // return label connected to text box
  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocused={isFocused}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
};

export default InputWithLabel;
