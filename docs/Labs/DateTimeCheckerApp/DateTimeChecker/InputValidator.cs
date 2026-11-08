#nullable enable
using System.Globalization;
using System.Text.RegularExpressions;

namespace DateTimeChecker
{
    public static class InputValidator
    {
        private static readonly Regex IntegerPattern = new Regex("^[+-]?[0-9]+$");

        public static CheckResult Check(string? dayText, string? monthText, string? yearText)
        {
            CheckResult? error;

            int day = ParseField(dayText, "Day", 1, 31, out error);
            if (error != null) return error;

            int month = ParseField(monthText, "Month", 1, 12, out error);
            if (error != null) return error;

            int year = ParseField(yearText, "Year", 1000, 3000, out error);
            if (error != null) return error;

            string date = $"{day:00}/{month:00}/{year:0000}";
            return DateChecker.CheckDate(year, month, day)
                ? new CheckResult(CheckStatus.ValidDate, "Message", $"{date} is correct date time!")
                : new CheckResult(CheckStatus.InvalidDate, "Message", $"{date} is NOT correct date time!");
        }

        private static int ParseField(string? text, string field, int min, int max, out CheckResult? error)
        {
            string trimmed = (text ?? string.Empty).Trim();
            if (!IntegerPattern.IsMatch(trimmed))
            {
                error = new CheckResult(CheckStatus.FormatError, "Error",
                    $"Input data for {field} is incorrect format!");
                return 0;
            }

            if (!int.TryParse(trimmed, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out int value)
                || value < min || value > max)
            {
                error = new CheckResult(CheckStatus.RangeError, "Error",
                    $"Input data for {field} is out of range!");
                return 0;
            }

            error = null;
            return value;
        }
    }
}
