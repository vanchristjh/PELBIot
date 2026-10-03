import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  // App defaults to /login route when unauthenticated
  const loginHeading = screen.getByText(/login/i);
  expect(loginHeading).toBeInTheDocument();
});
