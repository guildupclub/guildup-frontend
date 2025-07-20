import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt } from "react-icons/fa";

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

  const getIcon = () => {
    switch (name) {
      case "name":
        return <FaUser className="text-gray-400" />;
      case "email":
        return <FaEnvelope className="text-gray-400" />;
      case "phone":
        return <FaPhone className="text-gray-400" />;
      case "location":
        return <FaMapMarkerAlt className="text-gray-400" />;
      case "year_of_experience":
        return <FaBriefcase className="text-gray-400" />;
      case "session_conducted":
        return <FaCalendarAlt className="text-gray-400" />;
      default:
        return <FaUser className="text-gray-400" />;
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-400 text-base font-normal leading-7 font-[Source Sans Pro]">
        {label}
      </label>
      <div className="flex items-center rounded-md bg-white decoration-none border border-gray-500/80 text-muted-foreground">
        <span className="px-3 text-muted-foreground">{getIcon()}</span>
        {prefix && (
          <span className="px-2 text-muted-foreground border-r border-gray-300">{prefix}</span>
        )}
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-3 py-2 focus:ring-2 bg-white border-0 focus:outline-none"
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
    </div>
  );
};

export default InputField;
