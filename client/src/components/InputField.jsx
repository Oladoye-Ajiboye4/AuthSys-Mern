import React from 'react'

// A reusable input component that integrates with Formik for easy form handling and validation
// You can easily customize the styles and behavior of this component as needed across your app

const InputField = ({ type, name, placeholder, formik }) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        className={`p-3 rounded-lg border outline-none transition-colors ${
          hasError ? 'border-red-500' : 'border-gray-200'
        }`}
        type={type}
        placeholder={placeholder}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {hasError ? (
        <small className="text-red-500">{formik.errors[name]}</small>
      ) : null}
    </div>
  );
};

export default InputField