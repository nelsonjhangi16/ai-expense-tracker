function TransactionList() {
  const transactions = [
    { title: "Netflix", amount: "-$15" },
    { title: "Salary", amount: "+$2500" },
    { title: "Groceries", amount: "-$120" }
  ];

  return (
    <div className="card">
      <h3>Recent Transactions</h3>

      {transactions.map((item, index) => (
        <div className="transaction" key={index}>
          <span>{item.title}</span>
          <span>{item.amount}</span>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;