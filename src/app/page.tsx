import { getCategoryMeaning, getMarkup, getTrucks } from './trucks';

export default async function Home() {
  const trucks = await getTrucks();
  return (
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>VIN</th>
          <th>Model</th>
          <th>Dealer</th>
          <th>Exterior</th>
          <th>Interior</th>
          <th>MSRP</th>
          <th>Total</th>
          <th>Mark up</th>
          <th>Presold</th>
          <th>Hold Status</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {trucks.map((truck) => (
          <tr id={truck.vin}>
            <td><img src={truck.media[0].href} style={{ width: 64 }} /></td>
            <td>{truck.vin}</td>
            <td>{truck.model.marketingName}</td>
            <td>{truck.dealerMarketingName}</td>
            <td>{truck.extColor.marketingName}</td>
            <td>{truck.intColor.marketingName}</td>
            <td>{truck.price.totalMsrp}</td>
            <td>{truck.price.advertizedPrice}</td>
            <td>{getMarkup(truck.price.totalMsrp, truck.price.advertizedPrice)}</td>
            <td>{truck.isPreSold ? "✅" : "🚫"}</td>
            <td>{truck.holdStatus}</td>
            <td>{getCategoryMeaning(truck.dealerCategory)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
