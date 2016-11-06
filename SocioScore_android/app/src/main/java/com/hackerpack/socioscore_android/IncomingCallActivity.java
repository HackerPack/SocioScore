package com.hackerpack.socioscore_android;

import android.app.Activity;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.WindowManager;
import android.widget.TextView;

import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

public class IncomingCallActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        try {
            // TODO Auto-generated method stub
            super.onCreate(savedInstanceState);

            getWindow().addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);

            String phoneNumber = getIntent().getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
            HttpRequestTask httpRequestTask = new HttpRequestTask();
            httpRequestTask.execute(phoneNumber);
        } catch (Exception e) {
            Log.d("Exception", e.toString());
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private class HttpRequestTask extends AsyncTask<String, Void, Score> {
        @Override
        protected Score doInBackground(String... params) {
            String phoneNumber = params[0];
            Log.d("HttpRequestTask", phoneNumber);
            try {
                final String url = "http://10.126.79.76:3000/phone/"+phoneNumber;
                RestTemplate restTemplate = new RestTemplate();
                restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
                Score score = restTemplate.getForObject(url, Score.class);
//                Score score = new Score();
//                score.score = "100";
//                score.name = "Vivek";
//                score.phonenumber = "9876543210";
                return score;
            } catch (Exception e) {
                Log.e("MainActivity", e.getMessage(), e);
            }

            return null;
        }

        @Override
        protected void onPostExecute(Score score) {

            setContentView(R.layout.main);
//            setTitle(R.string.app_name);

            TextView text = (TextView) findViewById(R.id.phone_number);
            text.setText(score.getPhonenumber());


            text = (TextView) findViewById(R.id.caller_name);
            text.setText(score.getName()+"'s");


            text = (TextView) findViewById(R.id.score);
            text.setText(score.getScore());
            int intScore = Integer.parseInt(score.getScore());
            if(intScore>80)
                text.setTextColor(Color.GREEN);
            else if(intScore<40)
                text.setTextColor(Color.RED);
            else
                text.setTextColor(Color.YELLOW);

        }

    }
}