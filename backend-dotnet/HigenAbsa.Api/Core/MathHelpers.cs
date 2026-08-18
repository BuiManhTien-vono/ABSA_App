// Core/MathHelpers.cs - Port of Python sigmoid/softmax/round_float
namespace HigenAbsa.Api.Core;

public static class MathHelpers
{
    /// <summary>Element-wise sigmoid: 1 / (1 + exp(-x))</summary>
    public static float[] Sigmoid(float[] logits)
    {
        var result = new float[logits.Length];
        for (int i = 0; i < logits.Length; i++)
            result[i] = 1f / (1f + MathF.Exp(-logits[i]));
        return result;
    }

    /// <summary>Row-wise sigmoid on a 2D array [rows x cols]</summary>
    public static float[][] Sigmoid2D(float[][] logits)
    {
        var result = new float[logits.Length][];
        for (int i = 0; i < logits.Length; i++)
            result[i] = Sigmoid(logits[i]);
        return result;
    }

    /// <summary>Row-wise softmax on a 1D array (single row)</summary>
    public static float[] Softmax(float[] logits)
    {
        float max = logits[0];
        for (int i = 1; i < logits.Length; i++)
            if (logits[i] > max) max = logits[i];

        var exp = new float[logits.Length];
        float sum = 0f;
        for (int i = 0; i < logits.Length; i++)
        {
            exp[i] = MathF.Exp(logits[i] - max);
            sum += exp[i];
        }
        for (int i = 0; i < exp.Length; i++)
            exp[i] /= sum;
        return exp;
    }

    /// <summary>Round float to N decimal places (default 4)</summary>
    public static float RoundFloat(float value, int decimals = 4)
        => (float)Math.Round(value, decimals);

    /// <summary>Return index of maximum value in array</summary>
    public static int ArgMax(float[] arr)
    {
        int idx = 0;
        for (int i = 1; i < arr.Length; i++)
            if (arr[i] > arr[idx]) idx = i;
        return idx;
    }
}
