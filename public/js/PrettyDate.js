class PrettyDate{
    static shortDate(date, separator = "/"){
        //Input date format: YYYY-MM-DD
        //Output date format: DD/MM/YYYY
        let output = date.substring(8) +separator +date.substring(5,7) +separator +date.substring(0,4);
        return output;
    }

    static longDate(date, lowercase = false){
        //Input date format: YYYY-MM-DD
        //Output date format: DD de MONTH de YYYY
        let day = date.substring(8);
        if(day[0] === "0"){
            day = day.slice(1);
        }
        let month = date.substring(5,7);
        switch(month){
            case "01":
                month = "Janeiro";
                break;
            case "02":
                month = "Fevereiro";
                break;
            case "03":
                month = "Março";
                break;
            case "04":
                month = "Abril";
                break;
            case "05":
                month = "Maio";
                break;
            case "06":
                month = "Junho";
                break;
            case "07":
                month = "Julho";
                break;
            case "08":
                month = "Agosto";
                break;
            case "09":
                month = "Setembro";
                break;
            case "10":
                month = "Outubro";
                break;
            case "11":
                month = "Novembro";
                break;
            case "12":
                month = "Dezembro";
                break;
        }
        if(lowercase){
            month.toLowerCase();
        }
        let output = day + " de " +month +" de " +date.substring(0,4);
        return output;
    }

    static fullDate(date){
        let day = "";
        if(date.getDate() < 10){
            day = "0" +date.getDate().toString();
        }
        else{
            day = date.getDate().toString();
        }        

        let month = "";
        switch(date.getMonth()){
            case 0:
                month = "Janeiro";
                break;
            case 1:
                month = "Fevereiro";
                break;
            case 2:
                month = "Março";
                break;
            case 3:
                month = "Abril";
                break;
            case 4:
                month = "Maio";
                break;
            case 5:
                month = "Junho";
                break;
            case 6:
                month = "Julho";
                break;
            case 7:
                month = "Agosto";
                break;
            case 8:
                month = "Setembro";
                break;
            case 9:
                month = "Outubro";
                break;
            case 10:
                month = "Novembro";
                break;
            case 11:
                month = "Dezembro";
                break;
        }

        let hour = "";
        let minutes ="";

        if(date.getHours() < 10){
            hour = "0" +date.getHours().toString();
        }
        else{
            hour = date.getHours().toString();
        }

        if(date.getMinutes() < 10){
            minutes = "0" +date.getMinutes().toString();
        }
        else{
            minutes = date.getMinutes().toString();
        }

        let output = day +" de " +month +" de " +date.getFullYear().toString() +", às " +hour +"h" +minutes;

        return output;

    }

    static generateDateString(date){
        let output = "";

        output = date.getFullYear().toString() +'-';

        let month = date.getMonth() + 1;

        if(month < 10){
            output = output +'0' +month.toString() +'-';
        }
        else{
            output = output +month.toString() +'-';
        }

        if(date.getDate() < 10){
            output = output +'0' +date.getDate().toString();
        }
        else{
            output = output +date.getDate().toString();
        }

        return output;
    }
}