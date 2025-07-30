<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sortname');
            $table->string('phonecode');
            $table->timestamps();
        });

        DB::table('countries')->insert(
            array(
                [
                    "id" => 1,
                    "name" => "Afghanistan",
                    "sortname" => "AF",
                    "phonecode" => "93",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 2,
                    "name" => "Albania",
                    "sortname" => "AL",
                    "phonecode" => "355",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 3,
                    "name" => "Algeria",
                    "sortname" => "DZ",
                    "phonecode" => "213",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 4,
                    "name" => "American Samoa",
                    "sortname" => "AS",
                    "phonecode" => "1684",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 5,
                    "name" => "Andorra",
                    "sortname" => "AD",
                    "phonecode" => "376",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 6,
                    "name" => "Angola",
                    "sortname" => "AO",
                    "phonecode" => "244",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 7,
                    "name" => "Anguilla",
                    "sortname" => "AI",
                    "phonecode" => "1264",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 8,
                    "name" => "Antarctica",
                    "sortname" => "AQ",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 9,
                    "name" => "Antigua And Barbuda",
                    "sortname" => "AG",
                    "phonecode" => "1268",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 10,
                    "name" => "Argentina",
                    "sortname" => "AR",
                    "phonecode" => "54",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 11,
                    "name" => "Armenia",
                    "sortname" => "AM",
                    "phonecode" => "374",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 12,
                    "name" => "Aruba",
                    "sortname" => "AW",
                    "phonecode" => "297",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 13,
                    "name" => "Australia",
                    "sortname" => "AU",
                    "phonecode" => "61",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 14,
                    "name" => "Austria",
                    "sortname" => "AT",
                    "phonecode" => "43",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 15,
                    "name" => "Azerbaijan",
                    "sortname" => "AZ",
                    "phonecode" => "994",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 16,
                    "name" => "Bahamas The",
                    "sortname" => "BS",
                    "phonecode" => "1242",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 17,
                    "name" => "Bahrain",
                    "sortname" => "BH",
                    "phonecode" => "973",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 18,
                    "name" => "Bangladesh",
                    "sortname" => "BD",
                    "phonecode" => "880",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 19,
                    "name" => "Barbados",
                    "sortname" => "BB",
                    "phonecode" => "1246",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 20,
                    "name" => "Belarus",
                    "sortname" => "BY",
                    "phonecode" => "375",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 21,
                    "name" => "Belgium",
                    "sortname" => "BE",
                    "phonecode" => "32",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 22,
                    "name" => "Belize",
                    "sortname" => "BZ",
                    "phonecode" => "501",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 23,
                    "name" => "Benin",
                    "sortname" => "BJ",
                    "phonecode" => "229",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 24,
                    "name" => "Bermuda",
                    "sortname" => "BM",
                    "phonecode" => "1441",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 25,
                    "name" => "Bhutan",
                    "sortname" => "BT",
                    "phonecode" => "975",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 26,
                    "name" => "Bolivia",
                    "sortname" => "BO",
                    "phonecode" => "591",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 27,
                    "name" => "Bosnia and Herzegovina",
                    "sortname" => "BA",
                    "phonecode" => "387",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 28,
                    "name" => "Botswana",
                    "sortname" => "BW",
                    "phonecode" => "267",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 29,
                    "name" => "Bouvet Island",
                    "sortname" => "BV",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 30,
                    "name" => "Brazil",
                    "sortname" => "BR",
                    "phonecode" => "55",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 31,
                    "name" => "British Indian Ocean Territory",
                    "sortname" => "IO",
                    "phonecode" => "246",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 32,
                    "name" => "Brunei",
                    "sortname" => "BN",
                    "phonecode" => "673",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 33,
                    "name" => "Bulgaria",
                    "sortname" => "BG",
                    "phonecode" => "359",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 34,
                    "name" => "Burkina Faso",
                    "sortname" => "BF",
                    "phonecode" => "226",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 35,
                    "name" => "Burundi",
                    "sortname" => "BI",
                    "phonecode" => "257",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 36,
                    "name" => "Cambodia",
                    "sortname" => "KH",
                    "phonecode" => "855",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 37,
                    "name" => "Cameroon",
                    "sortname" => "CM",
                    "phonecode" => "237",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 38,
                    "name" => "Canada",
                    "sortname" => "CA",
                    "phonecode" => "1",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 39,
                    "name" => "Cape Verde",
                    "sortname" => "CV",
                    "phonecode" => "238",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 40,
                    "name" => "Cayman Islands",
                    "sortname" => "KY",
                    "phonecode" => "1345",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 41,
                    "name" => "Central African Republic",
                    "sortname" => "CF",
                    "phonecode" => "236",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 42,
                    "name" => "Chad",
                    "sortname" => "TD",
                    "phonecode" => "235",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 43,
                    "name" => "Chile",
                    "sortname" => "CL",
                    "phonecode" => "56",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 44,
                    "name" => "China",
                    "sortname" => "CN",
                    "phonecode" => "86",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 45,
                    "name" => "Christmas Island",
                    "sortname" => "CX",
                    "phonecode" => "61",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 46,
                    "name" => "Cocos (Keeling) Islands",
                    "sortname" => "CC",
                    "phonecode" => "672",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 47,
                    "name" => "Colombia",
                    "sortname" => "CO",
                    "phonecode" => "57",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 48,
                    "name" => "Comoros",
                    "sortname" => "KM",
                    "phonecode" => "269",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 49,
                    "name" => "Republic Of The Congo",
                    "sortname" => "CG",
                    "phonecode" => "242",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 50,
                    "name" => "Democratic Republic Of The Congo",
                    "sortname" => "CD",
                    "phonecode" => "242",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 51,
                    "name" => "Cook Islands",
                    "sortname" => "CK",
                    "phonecode" => "682",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 52,
                    "name" => "Costa Rica",
                    "sortname" => "CR",
                    "phonecode" => "506",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 53,
                    "name" => "Cote D'Ivoire (Ivory Coast)",
                    "sortname" => "CI",
                    "phonecode" => "225",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 54,
                    "name" => "Croatia (Hrvatska)",
                    "sortname" => "HR",
                    "phonecode" => "385",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 55,
                    "name" => "Cuba",
                    "sortname" => "CU",
                    "phonecode" => "53",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 56,
                    "name" => "Cyprus",
                    "sortname" => "CY",
                    "phonecode" => "357",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 57,
                    "name" => "Czech Republic",
                    "sortname" => "CZ",
                    "phonecode" => "420",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 58,
                    "name" => "Denmark",
                    "sortname" => "DK",
                    "phonecode" => "45",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 59,
                    "name" => "Djibouti",
                    "sortname" => "DJ",
                    "phonecode" => "253",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 60,
                    "name" => "Dominica",
                    "sortname" => "DM",
                    "phonecode" => "1767",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 61,
                    "name" => "Dominican Republic",
                    "sortname" => "DO",
                    "phonecode" => "1809",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 62,
                    "name" => "East Timor",
                    "sortname" => "TP",
                    "phonecode" => "670",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 63,
                    "name" => "Ecuador",
                    "sortname" => "EC",
                    "phonecode" => "593",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 64,
                    "name" => "Egypt",
                    "sortname" => "EG",
                    "phonecode" => "20",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 65,
                    "name" => "El Salvador",
                    "sortname" => "SV",
                    "phonecode" => "503",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 66,
                    "name" => "Equatorial Guinea",
                    "sortname" => "GQ",
                    "phonecode" => "240",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 67,
                    "name" => "Eritrea",
                    "sortname" => "ER",
                    "phonecode" => "291",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 68,
                    "name" => "Estonia",
                    "sortname" => "EE",
                    "phonecode" => "372",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 69,
                    "name" => "Ethiopia",
                    "sortname" => "ET",
                    "phonecode" => "251",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 70,
                    "name" => "External Territories of Australia",
                    "sortname" => "XA",
                    "phonecode" => "61",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 71,
                    "name" => "Falkland Islands",
                    "sortname" => "FK",
                    "phonecode" => "500",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 72,
                    "name" => "Faroe Islands",
                    "sortname" => "FO",
                    "phonecode" => "298",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 73,
                    "name" => "Fiji Islands",
                    "sortname" => "FJ",
                    "phonecode" => "679",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 74,
                    "name" => "Finland",
                    "sortname" => "FI",
                    "phonecode" => "358",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 75,
                    "name" => "France",
                    "sortname" => "FR",
                    "phonecode" => "33",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 76,
                    "name" => "French Guiana",
                    "sortname" => "GF",
                    "phonecode" => "594",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 77,
                    "name" => "French Polynesia",
                    "sortname" => "PF",
                    "phonecode" => "689",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 78,
                    "name" => "French Southern Territories",
                    "sortname" => "TF",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 79,
                    "name" => "Gabon",
                    "sortname" => "GA",
                    "phonecode" => "241",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 80,
                    "name" => "Gambia The",
                    "sortname" => "GM",
                    "phonecode" => "220",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 81,
                    "name" => "Georgia",
                    "sortname" => "GE",
                    "phonecode" => "995",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 82,
                    "name" => "Germany",
                    "sortname" => "DE",
                    "phonecode" => "49",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 83,
                    "name" => "Ghana",
                    "sortname" => "GH",
                    "phonecode" => "233",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 84,
                    "name" => "Gibraltar",
                    "sortname" => "GI",
                    "phonecode" => "350",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 85,
                    "name" => "Greece",
                    "sortname" => "GR",
                    "phonecode" => "30",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 86,
                    "name" => "Greenland",
                    "sortname" => "GL",
                    "phonecode" => "299",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 87,
                    "name" => "Grenada",
                    "sortname" => "GD",
                    "phonecode" => "1473",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 88,
                    "name" => "Guadeloupe",
                    "sortname" => "GP",
                    "phonecode" => "590",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 89,
                    "name" => "Guam",
                    "sortname" => "GU",
                    "phonecode" => "1671",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 90,
                    "name" => "Guatemala",
                    "sortname" => "GT",
                    "phonecode" => "502",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 91,
                    "name" => "Guernsey and Alderney",
                    "sortname" => "XU",
                    "phonecode" => "44",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 92,
                    "name" => "Guinea",
                    "sortname" => "GN",
                    "phonecode" => "224",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 93,
                    "name" => "Guinea-Bissau",
                    "sortname" => "GW",
                    "phonecode" => "245",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 94,
                    "name" => "Guyana",
                    "sortname" => "GY",
                    "phonecode" => "592",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 95,
                    "name" => "Haiti",
                    "sortname" => "HT",
                    "phonecode" => "509",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 96,
                    "name" => "Heard and McDonald Islands",
                    "sortname" => "HM",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 97,
                    "name" => "Honduras",
                    "sortname" => "HN",
                    "phonecode" => "504",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 98,
                    "name" => "Hong Kong S.A.R.",
                    "sortname" => "HK",
                    "phonecode" => "852",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 99,
                    "name" => "Hungary",
                    "sortname" => "HU",
                    "phonecode" => "36",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 100,
                    "name" => "Iceland",
                    "sortname" => "IS",
                    "phonecode" => "354",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 101,
                    "name" => "India",
                    "sortname" => "IN",
                    "phonecode" => "91",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 102,
                    "name" => "Indonesia",
                    "sortname" => "ID",
                    "phonecode" => "62",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 103,
                    "name" => "Iran",
                    "sortname" => "IR",
                    "phonecode" => "98",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 104,
                    "name" => "Iraq",
                    "sortname" => "IQ",
                    "phonecode" => "964",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 105,
                    "name" => "Ireland",
                    "sortname" => "IE",
                    "phonecode" => "353",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 106,
                    "name" => "Israel",
                    "sortname" => "IL",
                    "phonecode" => "972",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 107,
                    "name" => "Italy",
                    "sortname" => "IT",
                    "phonecode" => "39",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 108,
                    "name" => "Jamaica",
                    "sortname" => "JM",
                    "phonecode" => "1876",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 109,
                    "name" => "Japan",
                    "sortname" => "JP",
                    "phonecode" => "81",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 110,
                    "name" => "Jersey",
                    "sortname" => "XJ",
                    "phonecode" => "44",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 111,
                    "name" => "Jordan",
                    "sortname" => "JO",
                    "phonecode" => "962",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 112,
                    "name" => "Kazakhstan",
                    "sortname" => "KZ",
                    "phonecode" => "7",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 113,
                    "name" => "Kenya",
                    "sortname" => "KE",
                    "phonecode" => "254",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 114,
                    "name" => "Kiribati",
                    "sortname" => "KI",
                    "phonecode" => "686",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 115,
                    "name" => "Korea North",
                    "sortname" => "KP",
                    "phonecode" => "850",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 116,
                    "name" => "Korea South",
                    "sortname" => "KR",
                    "phonecode" => "82",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 117,
                    "name" => "Kuwait",
                    "sortname" => "KW",
                    "phonecode" => "965",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 118,
                    "name" => "Kyrgyzstan",
                    "sortname" => "KG",
                    "phonecode" => "996",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 119,
                    "name" => "Laos",
                    "sortname" => "LA",
                    "phonecode" => "856",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 120,
                    "name" => "Latvia",
                    "sortname" => "LV",
                    "phonecode" => "371",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 121,
                    "name" => "Lebanon",
                    "sortname" => "LB",
                    "phonecode" => "961",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 122,
                    "name" => "Lesotho",
                    "sortname" => "LS",
                    "phonecode" => "266",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 123,
                    "name" => "Liberia",
                    "sortname" => "LR",
                    "phonecode" => "231",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 124,
                    "name" => "Libya",
                    "sortname" => "LY",
                    "phonecode" => "218",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 125,
                    "name" => "Liechtenstein",
                    "sortname" => "LI",
                    "phonecode" => "423",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 126,
                    "name" => "Lithuania",
                    "sortname" => "LT",
                    "phonecode" => "370",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 127,
                    "name" => "Luxembourg",
                    "sortname" => "LU",
                    "phonecode" => "352",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 128,
                    "name" => "Macau S.A.R.",
                    "sortname" => "MO",
                    "phonecode" => "853",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 129,
                    "name" => "Macedonia",
                    "sortname" => "MK",
                    "phonecode" => "389",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 130,
                    "name" => "Madagascar",
                    "sortname" => "MG",
                    "phonecode" => "261",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 131,
                    "name" => "Malawi",
                    "sortname" => "MW",
                    "phonecode" => "265",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 132,
                    "name" => "Malaysia",
                    "sortname" => "MY",
                    "phonecode" => "60",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 133,
                    "name" => "Maldives",
                    "sortname" => "MV",
                    "phonecode" => "960",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 134,
                    "name" => "Mali",
                    "sortname" => "ML",
                    "phonecode" => "223",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 135,
                    "name" => "Malta",
                    "sortname" => "MT",
                    "phonecode" => "356",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 136,
                    "name" => "Man (Isle of)",
                    "sortname" => "XM",
                    "phonecode" => "44",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 137,
                    "name" => "Marshall Islands",
                    "sortname" => "MH",
                    "phonecode" => "692",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 138,
                    "name" => "Martinique",
                    "sortname" => "MQ",
                    "phonecode" => "596",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 139,
                    "name" => "Mauritania",
                    "sortname" => "MR",
                    "phonecode" => "222",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 140,
                    "name" => "Mauritius",
                    "sortname" => "MU",
                    "phonecode" => "230",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 141,
                    "name" => "Mayotte",
                    "sortname" => "YT",
                    "phonecode" => "269",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 142,
                    "name" => "Mexico",
                    "sortname" => "MX",
                    "phonecode" => "52",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 143,
                    "name" => "Micronesia",
                    "sortname" => "FM",
                    "phonecode" => "691",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 144,
                    "name" => "Moldova",
                    "sortname" => "MD",
                    "phonecode" => "373",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 145,
                    "name" => "Monaco",
                    "sortname" => "MC",
                    "phonecode" => "377",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 146,
                    "name" => "Mongolia",
                    "sortname" => "MN",
                    "phonecode" => "976",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 147,
                    "name" => "Montserrat",
                    "sortname" => "MS",
                    "phonecode" => "1664",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 148,
                    "name" => "Morocco",
                    "sortname" => "MA",
                    "phonecode" => "212",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 149,
                    "name" => "Mozambique",
                    "sortname" => "MZ",
                    "phonecode" => "258",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 150,
                    "name" => "Myanmar",
                    "sortname" => "MM",
                    "phonecode" => "95",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 151,
                    "name" => "Namibia",
                    "sortname" => "NA",
                    "phonecode" => "264",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 152,
                    "name" => "Nauru",
                    "sortname" => "NR",
                    "phonecode" => "674",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 153,
                    "name" => "Nepal",
                    "sortname" => "NP",
                    "phonecode" => "977",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 154,
                    "name" => "Netherlands Antilles",
                    "sortname" => "AN",
                    "phonecode" => "599",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 155,
                    "name" => "Netherlands The",
                    "sortname" => "NL",
                    "phonecode" => "31",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 156,
                    "name" => "New Caledonia",
                    "sortname" => "NC",
                    "phonecode" => "687",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 157,
                    "name" => "New Zealand",
                    "sortname" => "NZ",
                    "phonecode" => "64",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 158,
                    "name" => "Nicaragua",
                    "sortname" => "NI",
                    "phonecode" => "505",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 159,
                    "name" => "Niger",
                    "sortname" => "NE",
                    "phonecode" => "227",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 160,
                    "name" => "Nigeria",
                    "sortname" => "NG",
                    "phonecode" => "234",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 161,
                    "name" => "Niue",
                    "sortname" => "NU",
                    "phonecode" => "683",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 162,
                    "name" => "Norfolk Island",
                    "sortname" => "NF",
                    "phonecode" => "672",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 163,
                    "name" => "Northern Mariana Islands",
                    "sortname" => "MP",
                    "phonecode" => "1670",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 164,
                    "name" => "Norway",
                    "sortname" => "NO",
                    "phonecode" => "47",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 165,
                    "name" => "Oman",
                    "sortname" => "OM",
                    "phonecode" => "968",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 166,
                    "name" => "Pakistan",
                    "sortname" => "PK",
                    "phonecode" => "92",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 167,
                    "name" => "Palau",
                    "sortname" => "PW",
                    "phonecode" => "680",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 168,
                    "name" => "Palestinian Territory Occupied",
                    "sortname" => "PS",
                    "phonecode" => "970",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 169,
                    "name" => "Panama",
                    "sortname" => "PA",
                    "phonecode" => "507",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 170,
                    "name" => "Papua new Guinea",
                    "sortname" => "PG",
                    "phonecode" => "675",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 171,
                    "name" => "Paraguay",
                    "sortname" => "PY",
                    "phonecode" => "595",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 172,
                    "name" => "Peru",
                    "sortname" => "PE",
                    "phonecode" => "51",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 173,
                    "name" => "Philippines",
                    "sortname" => "PH",
                    "phonecode" => "63",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 174,
                    "name" => "Pitcairn Island",
                    "sortname" => "PN",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 175,
                    "name" => "Poland",
                    "sortname" => "PL",
                    "phonecode" => "48",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 176,
                    "name" => "Portugal",
                    "sortname" => "PT",
                    "phonecode" => "351",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 177,
                    "name" => "Puerto Rico",
                    "sortname" => "PR",
                    "phonecode" => "1787",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 178,
                    "name" => "Qatar",
                    "sortname" => "QA",
                    "phonecode" => "974",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 179,
                    "name" => "Reunion",
                    "sortname" => "RE",
                    "phonecode" => "262",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 180,
                    "name" => "Romania",
                    "sortname" => "RO",
                    "phonecode" => "40",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 181,
                    "name" => "Russia",
                    "sortname" => "RU",
                    "phonecode" => "70",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 182,
                    "name" => "Rwanda",
                    "sortname" => "RW",
                    "phonecode" => "250",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 183,
                    "name" => "Saint Helena",
                    "sortname" => "SH",
                    "phonecode" => "290",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 184,
                    "name" => "Saint Kitts And Nevis",
                    "sortname" => "KN",
                    "phonecode" => "1869",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 185,
                    "name" => "Saint Lucia",
                    "sortname" => "LC",
                    "phonecode" => "1758",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 186,
                    "name" => "Saint Pierre and Miquelon",
                    "sortname" => "PM",
                    "phonecode" => "508",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 187,
                    "name" => "Saint Vincent And The Grenadines",
                    "sortname" => "VC",
                    "phonecode" => "1784",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 188,
                    "name" => "Samoa",
                    "sortname" => "WS",
                    "phonecode" => "684",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 189,
                    "name" => "San Marino",
                    "sortname" => "SM",
                    "phonecode" => "378",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 190,
                    "name" => "Sao Tome and Principe",
                    "sortname" => "ST",
                    "phonecode" => "239",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 191,
                    "name" => "Saudi Arabia",
                    "sortname" => "SA",
                    "phonecode" => "966",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 192,
                    "name" => "Senegal",
                    "sortname" => "SN",
                    "phonecode" => "221",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 193,
                    "name" => "Serbia",
                    "sortname" => "RS",
                    "phonecode" => "381",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 194,
                    "name" => "Seychelles",
                    "sortname" => "SC",
                    "phonecode" => "248",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 195,
                    "name" => "Sierra Leone",
                    "sortname" => "SL",
                    "phonecode" => "232",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 196,
                    "name" => "Singapore",
                    "sortname" => "SG",
                    "phonecode" => "65",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 197,
                    "name" => "Slovakia",
                    "sortname" => "SK",
                    "phonecode" => "421",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 198,
                    "name" => "Slovenia",
                    "sortname" => "SI",
                    "phonecode" => "386",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 199,
                    "name" => "Smaller Territories of the UK",
                    "sortname" => "XG",
                    "phonecode" => "44",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 200,
                    "name" => "Solomon Islands",
                    "sortname" => "SB",
                    "phonecode" => "677",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 201,
                    "name" => "Somalia",
                    "sortname" => "SO",
                    "phonecode" => "252",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 202,
                    "name" => "South Africa",
                    "sortname" => "ZA",
                    "phonecode" => "27",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 203,
                    "name" => "South Georgia",
                    "sortname" => "GS",
                    "phonecode" => "0",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 204,
                    "name" => "South Sudan",
                    "sortname" => "SS",
                    "phonecode" => "211",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 205,
                    "name" => "Spain",
                    "sortname" => "ES",
                    "phonecode" => "34",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 206,
                    "name" => "Sri Lanka",
                    "sortname" => "LK",
                    "phonecode" => "94",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 207,
                    "name" => "Sudan",
                    "sortname" => "SD",
                    "phonecode" => "249",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 208,
                    "name" => "Suriname",
                    "sortname" => "SR",
                    "phonecode" => "597",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 209,
                    "name" => "Svalbard And Jan Mayen Islands",
                    "sortname" => "SJ",
                    "phonecode" => "47",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 210,
                    "name" => "Swaziland",
                    "sortname" => "SZ",
                    "phonecode" => "268",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 211,
                    "name" => "Sweden",
                    "sortname" => "SE",
                    "phonecode" => "46",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 212,
                    "name" => "Switzerland",
                    "sortname" => "CH",
                    "phonecode" => "41",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 213,
                    "name" => "Syria",
                    "sortname" => "SY",
                    "phonecode" => "963",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 214,
                    "name" => "Taiwan",
                    "sortname" => "TW",
                    "phonecode" => "886",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 215,
                    "name" => "Tajikistan",
                    "sortname" => "TJ",
                    "phonecode" => "992",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 216,
                    "name" => "Tanzania",
                    "sortname" => "TZ",
                    "phonecode" => "255",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 217,
                    "name" => "Thailand",
                    "sortname" => "TH",
                    "phonecode" => "66",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 218,
                    "name" => "Togo",
                    "sortname" => "TG",
                    "phonecode" => "228",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 219,
                    "name" => "Tokelau",
                    "sortname" => "TK",
                    "phonecode" => "690",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 220,
                    "name" => "Tonga",
                    "sortname" => "TO",
                    "phonecode" => "676",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 221,
                    "name" => "Trinidad And Tobago",
                    "sortname" => "TT",
                    "phonecode" => "1868",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 222,
                    "name" => "Tunisia",
                    "sortname" => "TN",
                    "phonecode" => "216",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 223,
                    "name" => "Turkey",
                    "sortname" => "TR",
                    "phonecode" => "90",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 224,
                    "name" => "Turkmenistan",
                    "sortname" => "TM",
                    "phonecode" => "7370",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 225,
                    "name" => "Turks And Caicos Islands",
                    "sortname" => "TC",
                    "phonecode" => "1649",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 226,
                    "name" => "Tuvalu",
                    "sortname" => "TV",
                    "phonecode" => "688",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 227,
                    "name" => "Uganda",
                    "sortname" => "UG",
                    "phonecode" => "256",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 228,
                    "name" => "Ukraine",
                    "sortname" => "UA",
                    "phonecode" => "380",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 229,
                    "name" => "United Arab Emirates",
                    "sortname" => "AE",
                    "phonecode" => "971",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 230,
                    "name" => "United Kingdom",
                    "sortname" => "GB",
                    "phonecode" => "44",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 231,
                    "name" => "United States",
                    "sortname" => "US",
                    "phonecode" => "1",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 232,
                    "name" => "United States Minor Outlying Islands",
                    "sortname" => "UM",
                    "phonecode" => "1",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 233,
                    "name" => "Uruguay",
                    "sortname" => "UY",
                    "phonecode" => "598",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 234,
                    "name" => "Uzbekistan",
                    "sortname" => "UZ",
                    "phonecode" => "998",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 235,
                    "name" => "Vanuatu",
                    "sortname" => "VU",
                    "phonecode" => "678",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 236,
                    "name" => "Vatican City State (Holy See)",
                    "sortname" => "VA",
                    "phonecode" => "39",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 237,
                    "name" => "Venezuela",
                    "sortname" => "VE",
                    "phonecode" => "58",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 238,
                    "name" => "Vietnam",
                    "sortname" => "VN",
                    "phonecode" => "84",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 239,
                    "name" => "Virgin Islands (British)",
                    "sortname" => "VG",
                    "phonecode" => "1284",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 240,
                    "name" => "Virgin Islands (US)",
                    "sortname" => "VI",
                    "phonecode" => "1340",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 241,
                    "name" => "Wallis And Futuna Islands",
                    "sortname" => "WF",
                    "phonecode" => "681",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 242,
                    "name" => "Western Sahara",
                    "sortname" => "EH",
                    "phonecode" => "212",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 243,
                    "name" => "Yemen",
                    "sortname" => "YE",
                    "phonecode" => "967",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 244,
                    "name" => "Yugoslavia",
                    "sortname" => "YU",
                    "phonecode" => "38",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 245,
                    "name" => "Zambia",
                    "sortname" => "ZM",
                    "phonecode" => "260",
                    "created_at" => null,
                    "updated_at" => null
                ],
                [
                    "id" => 246,
                    "name" => "Zimbabwe",
                    "sortname" => "ZW",
                    "phonecode" => "263",
                    "created_at" => null,
                    "updated_at" => null
                ]
            )
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('countries');
    }
};
