import type { BaseComponentProps } from '../types';

const AuthLayout = ({ children }: BaseComponentProps): JSX.Element => {
  return <div className="p-4">{children}</div>;
};

export default AuthLayout;
