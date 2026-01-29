import AktuelleBalance from "../_components/FeetF1rstBalance/AktuelleBalance";
import BalanceCard from "../_components/FeetF1rstBalance/BalanceCard";
import BalanceVerlaufChart from "../_components/FeetF1rstBalance/BalanceVerlaufChart";
import DataTables from "../_components/FeetF1rstBalance/DataTables";

export default function BalanceDashboard() {
    return (
        <div className="">
            <h1 className="text-2xl font-bold text-gray-800">FeetF1rst Balance</h1>
            <p className="text-gray-500 mt-2 max-w-6xl mb-6">
            Hier sehen Sie alle über FeetF1rst entstandenen Einnahmen und Ausgaben.
Am Monatsende erfolgt eine automatische Abrechnung – je nach Saldo erhalten Sie eine Auszahlung oder der Betrag wird eingezogen.

            </p>

            {/* Top Row: Aktuelle Balance + Balance Verlauf Chart */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="w-full lg:w-4/12">
                    <AktuelleBalance />
                </div>
                <div className="w-full lg:w-8/12">
                    <BalanceVerlaufChart />
                </div>
            </div>

            {/* Bottom Row: Four Stat Cards */}
            <BalanceCard />
            <DataTables />
        </div>
    );
}
