import numpy as np


def rmse(actual, predicted):
    """Root Mean Squared Error (V or %)."""
    return np.sqrt(np.mean((np.asarray(actual) - np.asarray(predicted)) ** 2))


def mae(actual, predicted):
    """Mean Absolute Error (V or %)."""
    return np.mean(np.abs(np.asarray(actual) - np.asarray(predicted)))


def max_abs_error(actual, predicted):
    """Maximum Absolute Error."""
    return np.max(np.abs(np.asarray(actual) - np.asarray(predicted)))


if __name__ == "__main__":
    a = np.array([1.0, 2.0, 3.0])
    b = np.array([1.1, 2.2, 2.8])
    print(f"RMSE = {rmse(a, b):.4f}")
    print(f"MAE  = {mae(a, b):.4f}")
    print(f"MAX  = {max_abs_error(a, b):.4f}")
