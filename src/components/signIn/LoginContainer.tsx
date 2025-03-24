import GoogleSignIn from "../common/GoogleSignIn";

export const LoginContainer: React.FC = () => {
  return (
    <div className="w-4/5 max-w-md bg-white rounded-lg shadow-lg">
      <GoogleSignIn/>
    </div>
  );
};