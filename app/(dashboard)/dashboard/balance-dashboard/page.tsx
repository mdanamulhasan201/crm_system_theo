import AktuelleBalance from "../_components/FeetF1rstBalance/AktuelleBalance";
import BalanceCard from "../_components/FeetF1rstBalance/BalanceCard";
import BalanceVerlaufChart from "../_components/FeetF1rstBalance/BalanceVerlaufChart";
import DataTables from "../_components/FeetF1rstBalance/DataTables";

export default function BalanceDashboard() {
    return (
        <div className="">
            <h1 className="text-2xl font-bold text-gray-800">FeetF1rst Balance</h1>
            <p className="text-gray-500 mt-2 max-w-6xl mb-6">
                Hier siehst du nur Beträge, die dir über die FeetF1rst App oder durch Gutschriften
                gutgeschrieben wurden (nicht Umsätze aus deinem Geschäft). Dieses Guthaben kannst
                du direkt für Bestellungen in FeetF1rst verwenden. Am Monatsende wird alles gesammelt
                abgerechnet bzw. ausbezahlt.
            </p>

            {/* Top Row: Aktuelle Balance + Balance Verlauf Chart */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="w-full lg:w-5/12">
                    <AktuelleBalance />
                </div>
                <div className="w-full lg:w-7/12">
                    <BalanceVerlaufChart />
                </div>
            </div>

            {/* Bottom Row: Four Stat Cards */}
            <BalanceCard />
            <DataTables />
        </div>
    );
}
