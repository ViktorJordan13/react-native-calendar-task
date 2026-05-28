import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/components/Button';

describe('Button', () => {
  it('renders its label', () => {
    const { getByText } = render(<Button label="Save" onPress={() => {}} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Tap" onPress={onPress} />);
    fireEvent.press(getByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button label="Nope" onPress={onPress} disabled testID="btn" />,
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner and blocks press while loading', () => {
    const onPress = jest.fn();
    const { getByTestId, queryByText } = render(
      <Button label="Loading" onPress={onPress} loading testID="btn" />,
    );
    expect(queryByText('Loading')).toBeNull();
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
