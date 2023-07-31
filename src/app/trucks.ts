import { request } from "graphql-request";
import { gql } from "graphql-request";
import { LocateVehiclesByZipResponse, VehicleSummary } from "./types";

export function getIsTRDPro(modelName: string) {
  const model = modelName.toLowerCase();

  return model.includes("pro");
}

export const INVENTORY_QUERY = gql`
  query LocateVehiclesByZip($zipCode: String, $brand: String, $pageNo: Int, $pageSize: Int, $seriesCodes: String, $distance: Int) {
    locateVehiclesByZip(zipCode: $zipCode, brand: $brand, pageNo: $pageNo, pageSize: $pageSize, seriesCodes: $seriesCodes, distance: $distance) {
      pagination {
        pageNo
        pageSize
        totalPages
        totalRecords
      }
      vehicleSummary {
        vin
        stockNum
        brand
        marketingSeries
        year
        isTempVin
        dealerCd
        dealerCategory
        distributorCd
        holdStatus
        weightRating
        isPreSold
        dealerMarketingName
        dealerWebsite
        isSmartPath
        distance
        isUnlockPriceDealer
        transmission {
          transmissionType
        }
        price {
          advertizedPrice
          nonSpAdvertizedPrice
          totalMsrp
          sellingPrice
          dph
          dioTotalMsrp
          dioTotalDealerSellingPrice
          dealerCashApplied
          baseMsrp
        }
        options {
          optionCd
          marketingName
          marketingLongName
          optionType
          packageInd
        }
        mpg {
          city
          highway
          combined
        }
        model {
          modelCd
          marketingName
          marketingTitle
        }
        media {
          type
          href
          imageTag
          source
        }
        intColor {
          colorCd
          colorSwatch
          marketingName
          nvsName
          colorFamilies
        }
        extColor {
          colorCd
          colorSwatch
          marketingName
          colorHexCd
          nvsName
          colorFamilies
        }
        eta {
          currFromDate
          currToDate
        }
        engine {
          engineCd
          name
        }
        drivetrain {
          code
          title
          bulletlist
        }
        family
        cab {
          code
          title
          bulletlist
        }
        bed {
          code
          title
          bulletlist
        }
      }
    }
  }
`;

export async function getTrucks() {
  const trucks: VehicleSummary[] = [];

  let totalPages = 1;
  let currentPage = 1;

  do {
    const result = await request<LocateVehiclesByZipResponse>({
      url: "https://api.search-inventory.toyota.com/graphql",
      document: INVENTORY_QUERY,
      requestHeaders: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      variables: {
        zipCode: "28270",
        brand: "TOYOTA",
        pageNo: currentPage,
        pageSize: 75,
        // seriesCodes: 'tundrahybrid,tacoma,tacomahybrid,hybridtacoma,sequoia',
        seriesCodes: 'tacoma,tacomahybrid',
        distance: 200,
      },
  });

    console.log("Page", currentPage, "/", totalPages)

    totalPages = result.locateVehiclesByZip.pagination.totalPages;
    currentPage++;

    for (const truck of result.locateVehiclesByZip.vehicleSummary) {
      // Skip non-TRD pros
      if (!getIsTRDPro(truck.model.marketingName)) {
        continue;
      }

      // Skip 3ed gen tacomas
      // if (truck.model.marketingName.toLowerCase().includes("tacoma") && truck.year < 2024) {
      //   continue;
      // }

      trucks.push(truck);
    }
  } while (currentPage <= totalPages);

  return trucks;
}

export function getMarkup(msrp: number | undefined | null, advertizedPrice: number | undefined | null) {
  if (!advertizedPrice) {
    return "unknown";
  }
  if (!msrp) {
    return "unknown";
  }
  return advertizedPrice - msrp;
}

export function getCategoryMeaning(dealerCategory: string) {
  switch (dealerCategory.toLowerCase()) {
    case 'a': 
      return "Allocated (A)"
    case 'g': 
      return "At dealer (G)"
    case 'f': 
      return "In transit (F)"
    default:
      return `Unknown ${dealerCategory}`
  }

}