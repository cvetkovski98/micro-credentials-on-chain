import { useFormikContext } from "formik";
import React from "react";

export interface SelectInputOption {
  value: number | bigint;
  label: string;
}

interface SelectInputFieldProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: SelectInputOption[];
}

export const SelectField: React.FC<SelectInputFieldProps> = (props) => {
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
        <select
          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 mb-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          {...rest}
          {...formik.getFieldProps(name)}
          onChange={(e) => {
            formik.setFieldValue(name, Number(e.target.value));
            props.onChange && props.onChange(e);
          }}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value.toString()}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {isTouched && errorMessage ? <div className="text-red-500 text-xs italic">{errorMessage}</div> : null}
    </div>
  );
};
