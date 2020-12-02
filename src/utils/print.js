/**
 * @param {AnyReportType[]} report
 */
function print(report) {
  process.stdout.write(
    report.flat().join(''),
  );
}

module.exports = print;
