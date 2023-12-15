import React from "react";
import { useFormikContext } from "formik";

interface TextInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export const TextField: React.FC<TextInputFieldProps> = (props) => {
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
      <input
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
