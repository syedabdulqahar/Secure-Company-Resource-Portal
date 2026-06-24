import DataTable from "./ui/DataTable";

export default function AttacksTab({ simulations, onRunSimulations }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Attack Simulation</h2>
        <button className="compact" onClick={onRunSimulations}>
          Run Tests
        </button>
      </div>
      <DataTable
        empty="No simulation run yet."
        columns={["Attack", "Scenario", "Expected", "Actual", "Result"]}
        rows={simulations.map((item) => [
          item.name,
          item.scenario,
          item.expected,
          item.actual,
          <span
            className={`pill ${item.result === "PASS" ? "allow" : "deny"}`}
          >
            {item.result}
          </span>,
        ])}
      />
    </section>
  );
}
