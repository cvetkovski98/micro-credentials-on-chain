import React from "react";

import { useFormikContext } from "formik";
import { SelectInputOption } from "./SelectInput";

interface MultiSelectInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  options: SelectInputOption[];
}

export const MultiSelectField: React.FC<MultiSelectInputFieldProps> = (props) => {
  const formik = useFormikContext();

  const { name, label, ...rest } = props;
  const nameKey = name as keyof typeof formik.values;
  const isTouched = formik.touched[nameKey];
  const errorMessage = formik.errors[nameKey];

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
        {label}
      </label>
      <div className="relative">
        <ul className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg ">
          {props.options.map((option) => (
            <li key={option.value} className="w-full border-b border-gray-200 rounded-t-lg ">
              <label className="flex items-center w-full py-3 ms-2 text-sm font-medium text-gray-900 ">
                <input
                  className="w-4 h-4 mx-2 ps-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  type="checkbox"
                  {...rest}
                  {...formik.getFieldProps(name)}
                  value={option.value.toString()}
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
      {isTouched && errorMessage ? <div className="text-red-500 text-xs italic">{errorMessage}</div> : null}
    </div>
  );
};
