import { FieldArray, FieldArrayRenderProps, Form, Formik, FormikConfig, FormikHelpers } from "formik";
import React from "react";
import * as Yup from "yup";
import { Claim, Organisation, User } from "../../badges/models";
import { SelectField, TextAreaField, TextField } from "../fields";
import { XIcon } from "../icons/XIcon";

export interface BadgeFormValues {
  title: string;
  description?: string;
  badgeType: number;
  issuerID: bigint;
  ownerID: string;
  claims: Claim[];
}

interface BadgeFormProps {
  onSubmit: (values: BadgeFormValues, helpers: FormikHelpers<BadgeFormValues>) => void;
  onOrganisationChange: (organisation_id: bigint) => void;
  organisations: Organisation[];
  users: User[];
  disabled?: boolean;
}

export const BadgeForm: React.FC<BadgeFormProps> = (props) => {
  const config: FormikConfig<BadgeFormValues> = {
    initialValues: {
      title: "",
      badgeType: 0,
      issuerID: props.organisations[0]?.organisationID,
      ownerID: props.users[0]?.principalID,
      claims: [],
    },
    enableReinitialize: true,
    onSubmit: (values: BadgeFormValues, helpers: FormikHelpers<BadgeFormValues>) => {
      props.onSubmit(values, helpers);
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Badge title is required"),
      description: Yup.string(),
      badgeType: Yup.number()
        .integer("Badge type must be an integer")
        .min(0, "Badge type must be greater than or equal to 0")
        .max(1, "Badge type must be less than or equal to 1")
        .required("Badge type is required")
        .typeError("Badge type must be a number"),
      issuerID: Yup.number()
        .integer("Issuer ID must be an integer")
        .min(0, "Issuer ID must be greater than or equal to 1")
        .required("Issuer ID is required")
        .typeError("Issuer ID must be a number"),
      ownerID: Yup.string().required("Owner ID is required"),
      claims: Yup.array().of(
        Yup.object({
          key: Yup.string().required("Required"),
          value: Yup.string().required("Required"),
        }).required("Required"),
      ),
    }),
  };

  return (
    <Formik {...config}>
      <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full px-3">
            <h2 className="text-lg font-bold">Details</h2>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full md:w-2/3 px-3 mb-6 md:mb-0">
            <TextField name="title" label="Title" disabled={props.disabled} />
          </div>
          <div className="w-full md:w-1/3 px-3">
            <SelectField
              name="badgeType"
              label="Type"
              options={[
                { value: 0, label: "Goal" },
                { value: 1, label: "Package" },
              ]}
              disabled={props.disabled}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full md:w-2/3 px-3 mb-6 md:mb-0">
            <SelectField
              name="issuerID"
              label="Organisation"
              options={props.organisations.map((o) => ({
                value: o.organisationID,
                label: o.name,
              }))}
              onChange={(event) => {
                props.onOrganisationChange(BigInt(event.target.value));
              }}
              disabled={props.disabled}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full md:w-2/3 px-3 mb-6 md:mb-0">
            <SelectField
              name="ownerID"
              label="User"
              options={props.users.map((s) => ({
                value: s.principalID,
                label: s.name,
              }))}
              disabled={props.disabled}
            />
          </div>
        </div>
        <TextAreaField name="description" label="Description" rows={5} disabled={props.disabled} />
        <div className="flex flex-wrap -mx-3 my-3">
          <div className="w-full px-3">
            <h2 className="text-lg font-bold">Claims</h2>
          </div>
        </div>
        <FieldArray
          name="claims"
          render={(arrayHelpers: FieldArrayRenderProps) => (
            <div>
              {arrayHelpers.form.values.claims.map((_: Claim, index: number) => (
                <div className="flex flex-wrap -mx-3 mb-3" key={index}>
                  <div className="w-4/12 px-3 mb-6 md:mb-0">
                    <TextField name={`claims.${index}.key`} label="Key" disabled={props.disabled} />
                  </div>
                  <div className="w-7/12 px-3">
                    <TextField name={`claims.${index}.value`} label="Value" disabled={props.disabled} />
                  </div>
                  <div className="w-1/12 px-3 flex items-end justify-center">
                    <button
                      className="p-1 mb-4 text-white bg-red-600 rounded-md align hover:bg-red-700"
                      type="button"
                      disabled={props.disabled}
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      <XIcon />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  className="px-2 py-1 text-white bg-gray-800 rounded-md"
                  type="button"
                  disabled={props.disabled}
                  onClick={() => arrayHelpers.push({ key: "", value: "" })}
                >
                  Add Claim
                </button>
              </div>
            </div>
          )}
        />

        <div className="flex items-end">
          <button className="px-4 py-2 mt-2 text-white bg-gray-800 rounded-md" type="submit">
            Submit
          </button>
        </div>
      </Form>
    </Formik>
  );
};
