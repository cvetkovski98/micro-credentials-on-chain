import { Form, Formik, FormikConfig, FormikHelpers } from "formik";
import React from "react";
import * as Yup from "yup";
import { Organisation, Role } from "../../badges/models";
import { SelectField, TextField } from "../fields";
import { MultiSelectField } from "../fields/MultiSelectInput";

export interface UserFormValues {
  name: string;
  email: string;
  organisationID: bigint;
  roles: bigint[];
}

interface UserFormProps {
  onSubmit: (values: UserFormValues, helpers: FormikHelpers<UserFormValues>) => void;
  organisations: Organisation[];
  roles: Role[];
  disabled?: boolean;
}

export const UserForm: React.FC<UserFormProps> = (props) => {
  const config: FormikConfig<UserFormValues> = {
    initialValues: {
      name: "",
      email: "",
      organisationID: props.organisations[0]?.organisationID,
      roles: [],
    },
    enableReinitialize: true,
    onSubmit: (values: UserFormValues, helpers: FormikHelpers<UserFormValues>) => {
      props.onSubmit(values, helpers);
    },
    validationSchema: Yup.object({
      name: Yup.string().required("User's full name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      organisationID: Yup.number().required("Organisation is required").typeError("Organisation must be a number"),
      roles: Yup.array().of(Yup.number()).required("Roles are required").typeError("Role must be a number"),
    }),
  };

  return (
    <Formik {...config}>
      <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full px-3">
            <h2 className="text-lg font-bold">Register user</h2>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full  px-3 mb-6 md:mb-0">
            <TextField name="name" label="Name & Last Name" disabled={props.disabled} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <TextField name="email" label="Email" disabled={props.disabled} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full  px-3 mb-6 md:mb-0">
            <SelectField
              name="organisationID"
              label="Organisation"
              options={props.organisations.map((o) => ({
                value: o.organisationID,
                label: o.name,
              }))}
              disabled={props.disabled}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 mb-6 md:mb-0">
            <MultiSelectField
              name="roles"
              label="Roles"
              options={props.roles.map((r) => ({
                value: r.roleID,
                label: r.name,
              }))}
              disabled={props.disabled}
            />
          </div>
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 mt-2 text-white bg-gray-800 rounded-md" type="submit">
            Submit
          </button>
        </div>
      </Form>
    </Formik>
  );
};
