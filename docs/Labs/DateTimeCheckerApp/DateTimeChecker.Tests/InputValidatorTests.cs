#nullable enable
using NUnit.Framework;
using DateTimeChecker;

namespace DateTimeChecker.Tests
{
    [TestFixture]
    public class InputValidatorTests
    {
        // Non-numeric, empty or non-ASCII input gives a format error.
        [TestCase("ab", "6", "2023", "Day")]
        [TestCase("15", "xy", "2023", "Month")]
        [TestCase("15", "6", "abcd", "Year")]
        [TestCase("", "6", "2023", "Day")]
        [TestCase(null, "6", "2023", "Day")]
        [TestCase("1.5", "6", "2023", "Day")]
        [TestCase("\u0661\u0662", "6", "2023", "Day")]
        [TestCase("\uFF11\uFF12", "6", "2023", "Day")]
        public void FormatError(string? d, string? m, string? y, string field) =>
            Assert.That(InputValidator.Check(d, m, y), Is.EqualTo(new CheckResult(
                CheckStatus.FormatError, "Error", $"Input data for {field} is incorrect format!")));

        // Numbers outside the allowed range, including overflow, give a range error.
        [TestCase("0", "6", "2023", "Day")]
        [TestCase("32", "6", "2023", "Day")]
        [TestCase("-1", "6", "2023", "Day")]
        [TestCase("99999999999", "6", "2023", "Day")]
        [TestCase("15", "0", "2023", "Month")]
        [TestCase("15", "13", "2023", "Month")]
        [TestCase("15", "6", "999", "Year")]
        [TestCase("15", "6", "3001", "Year")]
        public void RangeError(string? d, string? m, string? y, string field) =>
            Assert.That(InputValidator.Check(d, m, y), Is.EqualTo(new CheckResult(
                CheckStatus.RangeError, "Error", $"Input data for {field} is out of range!")));

        // Day is validated before Month and Year.
        [Test]
        public void DayCheckedBeforeMonth() =>
            Assert.That(InputValidator.Check("ab", "xy", "abcd").Message,
                Is.EqualTo("Input data for Day is incorrect format!"));

        // Real dates are reported as correct, zero-padded.
        [TestCase("29", "2", "2020", "29/02/2020 is correct date time!")]
        [TestCase("29", "2", "2000", "29/02/2000 is correct date time!")]
        [TestCase("1", "1", "1000", "01/01/1000 is correct date time!")]
        [TestCase("31", "12", "3000", "31/12/3000 is correct date time!")]
        [TestCase(" 15 ", " 6 ", " 2023 ", "15/06/2023 is correct date time!")]
        public void ValidDate(string? d, string? m, string? y, string message) =>
            Assert.That(InputValidator.Check(d, m, y), Is.EqualTo(new CheckResult(
                CheckStatus.ValidDate, "Message", message)));

        // Well-formed but impossible dates are reported as not correct.
        [TestCase("29", "2", "2019", "29/02/2019 is NOT correct date time!")]
        [TestCase("29", "2", "1900", "29/02/1900 is NOT correct date time!")]
        [TestCase("31", "4", "2021", "31/04/2021 is NOT correct date time!")]
        public void InvalidDate(string? d, string? m, string? y, string message) =>
            Assert.That(InputValidator.Check(d, m, y), Is.EqualTo(new CheckResult(
                CheckStatus.InvalidDate, "Message", message)));
    }
}
