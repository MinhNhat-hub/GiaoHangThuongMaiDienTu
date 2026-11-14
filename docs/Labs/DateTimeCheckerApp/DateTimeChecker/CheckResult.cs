#nullable enable
namespace DateTimeChecker
{
    public enum CheckStatus { FormatError, RangeError, ValidDate, InvalidDate }

    public sealed record CheckResult(CheckStatus Status, string Title, string Message);
}
