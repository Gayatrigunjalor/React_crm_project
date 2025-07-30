<?php

namespace App\Services;

class FinancialYearService
{
    public function getFinancialYear()
    {
        $date = date_create(date('Y-m-d'));

        if (date_format($date, "m") >= 4) {
            //On or After April (FY is current year - next year)
            $financial_year = (date_format($date, "Y")) . '-' . (date_format($date, "y") + 1);
        } else {
            //On or Before March (FY is previous year - current year)
            $financial_year = (date_format($date, "Y") - 1) . '-' . date_format($date, "y");
        }

        return $financial_year;
    }
}
