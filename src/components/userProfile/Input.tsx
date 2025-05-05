import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputFieldProps {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  prefix?: string;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  disabled = false,
  prefix,
  isPasswordVisible,
  onTogglePasswordVisibility,
}) => {
  const inputType =
    type === "password" ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block text-[#19191A] text-base font-normal leading-7 font-[Source Sans Pro]">
        {label}
      </label>
      {prefix || type === "password" ? (
        <div className="flex items-center  rounded-md bg-white  decoration-none  shadow-md border border-gray-100 text-primary ">
          {prefix && <span className="px-3 text-primary">{prefix}</span>}
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 focus:ring-2 bg-white"
          />
          {type === "password" && onTogglePasswordVisibility && (
            <span
              className="px-3 cursor-pointer"
              onClick={onTogglePasswordVisibility}
            >
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          )}
        </div>
      ) : (
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-md bg-white decoration-none  shadow-md border border-gray-100 text-primary"
        />
      )}
    </div>
  );
};

export default InputField;
