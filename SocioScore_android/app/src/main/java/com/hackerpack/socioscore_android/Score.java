package com.hackerpack.socioscore_android;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Created by bharathi_pc on 11/5/2016.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Score {
    private String name;
    private String score;
    private String phonenumber;

    public String getName() {
        return this.name;
    }

    public String getScore() {
        return this.score;
    }

    public String getPhonenumber() {
        return this.phonenumber;
    }
}
