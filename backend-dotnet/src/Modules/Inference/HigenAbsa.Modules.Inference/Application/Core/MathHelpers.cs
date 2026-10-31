namespace HigenAbsa.Modules.Inference.Application.Core;

public static class MathHelpers
{
    public static float[] Sigmoid(float[] logits)
    {
        var result = new float[logits.Length];
        for (int i = 0; i < logits.Length; i++)
            result[i] = 1f / (1f + MathF.Exp(-logits[i]));
        return result;
    }

    public static float[][] Sigmoid2D(float[][] logits)
    {
        var result = new float[logits.Length][];
        for (int i = 0; i < logits.Length; i++)
            result[i] = Sigmoid(logits[i]);
        return result;
    }

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

    public static float RoundFloat(float value, int decimals = 4)
        => (float)Math.Round(value, decimals);

    public static int ArgMax(float[] arr)
    {
        int idx = 0;
        for (int i = 1; i < arr.Length; i++)
            if (arr[i] > arr[idx]) idx = i;
        return idx;
    }
}
