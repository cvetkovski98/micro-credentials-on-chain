import React from "react";
import { useFormikContext } from "formik";

interface TextAreaFieldProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  rows: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = (props) => {
  const formik = useFormikContext();

  const { name, label, ...rest } = props;
  const nameKey = name as keyof typeof formik.values;
  const isTouched = formik.touched[nameKey];
  const errorMessage = formik.errors[nameKey];

  const hasError = isTouched && errorMessage;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
      >
        {label}
      </label>
      <textarea
        className={
          "appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white" +
          (hasError ? " border-red-500" : "")
        }
        {...rest}
        {...formik.getFieldProps(name)}
      />
      {hasError ? (
        <div className="text-red-500 text-xs italic">{errorMessage}</div>
      ) : null}
    </div>
  );
};
